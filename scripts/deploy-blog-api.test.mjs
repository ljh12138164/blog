import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve, sep } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const bash =
  process.platform === 'win32'
    ? join(
        dirname(
          dirname(execFileSync('where.exe', ['git'], { encoding: 'utf8' }).trim().split(/\r?\n/)[0])
        ),
        'bin/bash.exe'
      )
    : 'bash'
const tag = `sha-${'a'.repeat(40)}`
const oldTag = `sha-${'b'.repeat(40)}`
const script = readFileSync(join(root, 'deploy/server/deploy-blog-api'), 'utf8').replaceAll(
  '\r\n',
  '\n'
)

function fixture(run, { failure = '', bootstrap = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'blog-api-deploy-test-'))
  const put = (path, content) => {
    mkdirSync(dirname(join(dir, path)), { recursive: true })
    writeFileSync(join(dir, path), content, { mode: 0o755 })
  }
  try {
    put('stack/.env', `IMAGE_TAG=${oldTag}\nSESSION_SECRET=fixture-only\n`)
    put('stack/compose.api.yaml', 'previous compose\n')
    put('installed/deploy-blog-api', '#!/bin/bash\n# previous helper\n')
    if (bootstrap) put('stack/bootstrap-password.hash', '$argon2id$bootstrap-fixture\n')
    put(
      'deploy.sh',
      script
        .replace('STACK_DIR=/opt/stacks/blog-storage', 'STACK_DIR="$PWD/stack"')
        .replace(
          'DEPLOY_SCRIPT=/usr/local/sbin/deploy-blog-api',
          'DEPLOY_SCRIPT="$PWD/installed/deploy-blog-api"'
        )
        .replace('exec 8>/run/lock/blog-api-deploy.lock', 'exec 8>"$STACK_DIR/deploy.lock"')
    )
    put('bundle/image.tar', 'fixture image')
    put('bundle/compose.api.yaml', 'candidate compose\n')
    put('bundle/deploy/server/deploy-blog-api', '#!/bin/bash\n# candidate helper\n')
    put('bin/flock', '#!/bin/bash\n[[ "$FAKE_FAIL" != lock ]]\n')
    put(
      'bin/docker',
      `#!/bin/bash
set -eu
printf '%s\\n' "$*" >> "$PWD/calls.log"
case " $* " in
  *' pg_dump '*) [[ "$FAKE_FAIL" != backup ]]; printf 'database archive';;
  *' pg_restore --list '*) cat >/dev/null;;
  *' printenv JOURNAL_PASSWORD_HASH '*) printf '$argon2id$legacy-fixture';;
  *' dist/database/migrate.js '*)
    printf '%s' "$JOURNAL_PASSWORD_HASH" > "$PWD/migration-hash"
    [[ "$FAKE_FAIL" != migration ]];;
  *' SELECT count('* ) if [[ "$FAKE_FAIL" == credential ]]; then echo 0; else echo 1; fi;;
  *' up -d '*)
    if [[ "$FAKE_FAIL" == up ]] && grep -q '${tag}' stack/.env; then exit 9; fi;;
esac
`
    )
    put(
      'bin/curl',
      `#!/bin/bash
printf 'curl\\n' >> "$PWD/calls.log"
if [[ "$FAKE_FAIL" == health ]] && [[ ! -f "$PWD/health-failed" ]]; then
  touch "$PWD/health-failed"
  exit 22
fi
printf '{"status":"ok"}'
`
    )
    const packed = spawnSync(
      bash,
      [
        '-c',
        'tar -czf release.tar.gz -C bundle image.tar compose.api.yaml deploy/server/deploy-blog-api'
      ],
      { cwd: dir, encoding: 'utf8' }
    )
    assert.equal(packed.status, 0, packed.stderr)
    const result = spawnSync(
      bash,
      [
        '-c',
        'export PATH="$PWD/bin:$PATH"; exec bash ./deploy.sh "$1" < release.tar.gz',
        'test',
        tag
      ],
      {
        cwd: dir,
        env: { ...process.env, FAKE_FAIL: failure },
        encoding: 'utf8',
        timeout: 15000
      }
    )
    run({ result, dir, read: (path) => readFileSync(join(dir, path), 'utf8') })
  } finally {
    assert.ok(resolve(dir).startsWith(resolve(tmpdir()) + sep))
    rmSync(dir, { recursive: true, force: true })
  }
}

test('API release backs up before migration, updates only API and consumes the bootstrap hash', () => {
  fixture(
    ({ result, dir, read }) => {
      assert.equal(result.status, 0, result.stderr)
      assert.match(read('stack/.env'), new RegExp(tag))
      assert.match(read('stack/.env'), /SESSION_SECRET=fixture-only/)
      assert.equal(read('stack/compose.api.yaml'), 'candidate compose\n')
      assert.match(read('installed/deploy-blog-api'), /candidate helper/)
      const calls = read('calls.log')
      assert.ok(calls.indexOf('pg_dump') < calls.indexOf('dist/database/migrate.js'))
      assert.ok(calls.indexOf('dist/database/migrate.js') < calls.indexOf(' up -d '))
      assert.match(calls, /up -d --no-deps --wait --wait-timeout 90 api/)
      assert.doesNotMatch(calls, /down|--remove-orphans|up .*postgres|\$argon2id/)
      assert.equal(read('migration-hash'), '$argon2id$bootstrap-fixture')
      assert.equal(existsSync(join(dir, 'stack/bootstrap-password.hash')), false)
    },
    { bootstrap: true }
  )
})

for (const failure of ['migration', 'credential', 'up', 'health']) {
  test(`${failure} failure restores previous API configuration without restoring the database`, () => {
    fixture(
      ({ result, read }) => {
        assert.notEqual(result.status, 0)
        assert.match(result.stderr, /rollback healthy/)
        assert.match(read('stack/.env'), new RegExp(oldTag))
        assert.equal(read('stack/compose.api.yaml'), 'previous compose\n')
        assert.match(read('installed/deploy-blog-api'), /previous helper/)
        assert.doesNotMatch(read('calls.log'), /pg_restore(?! --list)|down|--remove-orphans/)
      },
      { failure }
    )
  })
}

test('backup failure leaves the running application and configuration unchanged', () => {
  fixture(
    ({ result, read }) => {
      assert.notEqual(result.status, 0)
      assert.match(read('stack/.env'), new RegExp(oldTag))
      assert.doesNotMatch(read('calls.log'), /dist\/database\/migrate|up -d/)
    },
    { failure: 'backup' }
  )
})

test('first database initialization can import the previous API password without logging it', () => {
  fixture(({ result, read }) => {
    assert.equal(result.status, 0, result.stderr)
    assert.equal(read('migration-hash'), '$argon2id$legacy-fixture')
    assert.doesNotMatch(result.stdout + result.stderr + read('calls.log'), /\$argon2id/)
  })
})

test('a competing deployment is rejected before touching application configuration', () => {
  fixture(
    ({ result, dir, read }) => {
      assert.equal(result.status, 3)
      assert.match(read('stack/.env'), new RegExp(oldTag))
      assert.equal(existsSync(join(dir, 'calls.log')), false)
    },
    { failure: 'lock' }
  )
})

test('restricted SSH gate permits only the two deployment commands and valid immutable tags', () => {
  const dir = mkdtempSync(join(tmpdir(), 'blog-api-gate-test-'))
  try {
    mkdirSync(join(dir, 'bin'))
    writeFileSync(join(dir, 'bin/sudo'), '#!/bin/sh\nprintf "%s\\n" "$*"\n', { mode: 0o755 })
    writeFileSync(
      join(dir, 'gate'),
      readFileSync(join(root, 'deploy/server/blog-deploy-gate'), 'utf8').replaceAll('\r\n', '\n')
    )
    const execute = (command) =>
      spawnSync(bash, ['-c', 'export PATH="$PWD/bin:$PATH"; exec bash ./gate'], {
        cwd: dir,
        encoding: 'utf8',
        env: { ...process.env, SSH_ORIGINAL_COMMAND: command }
      })
    for (const command of ['deploy', 'deploy-api']) {
      const result = execute(`${command} ${tag}`)
      assert.equal(result.status, 0, result.stderr)
      assert.match(
        result.stdout,
        new RegExp(command === 'deploy' ? '/deploy-blog ' : '/deploy-blog-api ')
      )
    }
    for (const command of [
      '',
      'bash',
      `deploy-api latest`,
      `deploy-api ${tag} extra`,
      `deploy-api ${tag};id`,
      `other ${tag}`
    ]) {
      assert.equal(execute(command).status, 126, command)
    }
  } finally {
    assert.ok(resolve(dir).startsWith(resolve(tmpdir()) + sep))
    rmSync(dir, { recursive: true, force: true })
  }
})
