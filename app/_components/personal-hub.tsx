import Image from 'next/image'
import Link from 'next/link'
import { ImageZoom } from 'nextra/components'
import type { ReactNode } from 'react'
import { profile } from '@/lib/profile'
import { skills } from '@/lib/profile-skills'
import { site } from '@/lib/site'
import { ProfileSkills, RepositoryStats } from './profile-interactions'

function HubSection({
  id,
  label,
  title,
  children
}: {
  id: string
  label: string
  title: string
  children: ReactNode
}) {
  return (
    <section
      className="scroll-mt-24 border-t border-line py-10"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <p className="m-0 font-mono text-[11px] font-bold text-accent">{label}</p>
      <h2 className="mt-2 mb-6 text-balance text-2xl font-bold" id={`${id}-title`}>
        {title}
      </h2>
      {children}
    </section>
  )
}

export function PersonalIntroduction() {
  const { author } = profile
  return (
    <header className="py-16 max-md:py-12">
      <div className="mb-7 flex items-center gap-4">
        <Image
          className="size-16 rounded-full border border-line object-cover"
          src={author.avatar}
          alt="李建辉的头像"
          width={64}
          height={64}
        />
        <div className="min-w-0">
          <p className="m-0 font-mono text-xs font-bold text-accent">ABOUT / FIELD NOTES</p>
          <p className="mt-2 mb-0 truncate text-sm text-muted">
            @{author.nickname} · {author.location}
          </p>
        </div>
      </div>
      <h1 className="mt-0 mb-5 text-balance text-5xl leading-[1.2] font-extrabold max-md:text-[36px]">
        你好，我是李建辉。
        <br />
        写代码，记录取舍。
      </h1>
      <p className="m-0 text-pretty text-[17px] leading-8 text-muted">
        {author.jobTitle} · {author.bio}
      </p>
      <p className="mt-3 mb-0 text-pretty leading-7 text-muted">
        这里放我的工具、开源贡献和技术手记。写前端架构、实时协同、Web 性能与 AI
        工程，也留下那些最后没有采用的方案。
      </p>
      <p className="mt-6 mb-0 border-l-2 border-accent pl-4 text-pretty text-sm leading-7 text-muted">
        {author.quote}
      </p>
      <nav
        className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-sm font-bold text-accent"
        aria-label="个人站快捷入口"
      >
        <Link className="inline-flex min-h-11 items-center" href="/posts">
          阅读手记 →
        </Link>
        <a className="inline-flex min-h-11 items-center" href="#sites-section">
          我的网站 ↓
        </a>
        <a className="inline-flex min-h-11 items-center" href={author.github}>
          GitHub ↗
        </a>
        <a className="inline-flex min-h-11 items-center" href={`mailto:${author.email}`}>
          发送邮件 ↗
        </a>
      </nav>
      <ul className="mt-5 mb-0 flex list-none flex-wrap gap-2 p-0" aria-label="个人标签">
        {author.tags.map((tag) => (
          <li className="rounded-sm bg-code px-2 py-1 text-xs text-muted" key={tag}>
            {tag}
          </li>
        ))}
      </ul>
    </header>
  )
}

export function PersonalSites() {
  return (
    <HubSection id="sites-section" label="BUILD / USE" title="我做的几个网站">
      <div>
        {profile.sites.map((entry) => (
          <article
            className="grid grid-cols-[160px_minmax(0,1fr)] items-start gap-6 border-t border-line py-6 max-sm:grid-cols-1 max-sm:gap-4"
            key={entry.id}
          >
            <ImageZoom
              className="m-0 w-full rounded-sm border border-line"
              src={entry.preview}
              alt={`${entry.name} 首页预览`}
              width={480}
              height={300}
              loading="lazy"
            />
            <div className="min-w-0">
              <p className="m-0 font-mono text-[11px] text-accent">{entry.category}</p>
              <h3 className="my-1 text-balance text-lg font-bold">
                <Link
                  className="inline-flex min-h-11 items-center hover:text-accent"
                  href={entry.url}
                >
                  {entry.name} ↗
                </Link>
              </h3>
              <p className="m-0 text-pretty text-sm leading-7 text-muted">{entry.description}</p>
              <p className="mt-2 mb-0 break-all font-mono text-xs text-muted">
                {entry.id === 'blog' ? `${site.url}/posts` : entry.url}
              </p>
            </div>
          </article>
        ))}
      </div>
      <nav className="mt-4 border-t border-line pt-5" aria-label="常用工具直达">
        <h3 className="m-0 text-balance text-sm font-bold">常用工具直达</h3>
        <ul className="m-0 grid list-none grid-cols-3 gap-4 p-0 max-sm:grid-cols-1 max-sm:gap-0">
          {profile.quickTools.map((tool) => (
            <li key={tool.slug}>
              <a
                className="inline-flex min-h-11 items-center text-sm text-accent"
                href={`https://tools.ljhboard.cn/tools/${tool.slug}`}
              >
                {tool.name} ↗
              </a>
              <p className="m-0 text-pretty text-xs leading-6 text-muted">{tool.description}</p>
            </li>
          ))}
        </ul>
      </nav>
    </HubSection>
  )
}

export function PersonalWork() {
  return (
    <>
      <HubSection id="activity" label="PUBLIC / ACTIVITY" title="GitHub 公开贡献">
        <p className="mt-0 text-pretty text-sm leading-7 text-muted">
          贡献图记录公开活动，具体做了什么，可以继续看下面的 PR。
          <a className="text-accent" href={profile.author.github}>
            在 GitHub 查看 ↗
          </a>
        </p>
        <section
          className="overflow-x-auto rounded-sm border border-line bg-code p-4"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users must be able to scroll the wide contribution chart.
          tabIndex={0}
          aria-label="GitHub 贡献贪吃蛇，可横向滚动"
        >
          <Image
            className="profile-snake-light block h-auto min-w-[720px] w-full"
            src="/profile/snake-light.svg"
            alt="ljh12138164 的 GitHub 公开贡献贪吃蛇动画"
            width={856}
            height={122}
            loading="lazy"
          />
          <Image
            className="profile-snake-dark hidden h-auto min-w-[720px] w-full"
            src="/profile/snake-dark.svg"
            alt="ljh12138164 的 GitHub 公开贡献贪吃蛇动画"
            width={856}
            height={122}
            loading="lazy"
          />
        </section>
        <p className="mt-3 mb-0 text-pretty text-xs leading-6 text-muted">
          贡献图为已保存的公开活动快照，具体记录以 GitHub 为准。
        </p>
      </HubSection>
      <HubSection id="projects" label="CHANGE / EVIDENCE" title="我的开源贡献">
        {profile.projects.map((project) => (
          <article className="border-t border-line py-6" key={project.repo}>
            <h3 className="m-0 break-words text-balance text-lg font-bold">
              <a className="inline-flex min-h-11 items-center hover:text-accent" href={project.url}>
                {project.name} ↗
              </a>
            </h3>
            <p className="mt-1 mb-0 text-pretty text-sm text-muted">{project.description}</p>
            <RepositoryStats repo={project.repo} stars={project.stars} forks={project.forks} />
            <details className="mt-5 rounded-sm border border-line px-4" open>
              <summary className="cursor-pointer py-3 text-sm font-bold">
                {project.contribution.title}
              </summary>
              <div className="border-t border-line py-4">
                <dl className="m-0 text-sm leading-7">
                  <dt className="font-bold">解决什么问题</dt>
                  <dd className="ml-0 text-pretty text-muted">{project.contribution.problem}</dd>
                  <dt className="mt-3 font-bold">我做的部分</dt>
                  <dd className="ml-0 text-pretty text-muted">{project.contribution.work}</dd>
                </dl>
                {project.contribution.image && (
                  <figure className="mx-0 my-5">
                    <ImageZoom
                      className="h-auto w-full rounded-sm border border-line"
                      src={project.contribution.image.url}
                      alt={project.contribution.image.alt}
                      width={project.contribution.image.width}
                      height={project.contribution.image.height}
                      loading="lazy"
                    />
                    <figcaption className="mt-2 text-xs text-muted">
                      PR 中的实现截图 · 点击放大
                    </figcaption>
                  </figure>
                )}
                <a
                  className="inline-flex min-h-11 items-center text-sm font-bold text-accent"
                  href={project.contribution.pr}
                >
                  查看我的 PR #{project.contribution.number} ↗
                </a>
                <p className="m-0 text-pretty text-xs leading-6 text-muted">
                  状态核实于 {project.contribution.checkedAt}：
                  {project.contribution.status === 'merged' ? '已合并' : '审核中'}。当前状态以 PR
                  为准。
                </p>
              </div>
            </details>
          </article>
        ))}
      </HubSection>
      <HubSection id="skills" label="TOOLS / PRACTICE" title="技术栈与实践方向">
        <p className="mt-0 text-pretty text-sm leading-7 text-muted">
          {skills.length} 项技术与工具，按领域整理。日常以 TypeScript、React、Vue
          为主，也处理构建、数据和部署；Nuxt.js 了解一些。
        </p>
        <ProfileSkills />
      </HubSection>
    </>
  )
}
