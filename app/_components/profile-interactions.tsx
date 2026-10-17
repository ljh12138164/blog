'use client'

import { useEffect, useState } from 'react'
import { skillIcons } from '@/lib/profile-icons'
import { skillCategories, skills } from '@/lib/profile-skills'

export function ProfileSkills() {
  const [category, setCategory] = useState('all')

  return (
    <>
      <fieldset className="my-5 flex flex-wrap gap-2" aria-label="技术栈分类">
        {skillCategories.map((item) => (
          <button
            className="min-h-11 cursor-pointer rounded-sm border border-line px-3 text-sm text-muted hover:text-accent aria-pressed:border-accent aria-pressed:bg-accent-soft aria-pressed:text-accent"
            type="button"
            key={item.id}
            aria-pressed={category === item.id}
            onClick={() => setCategory(item.id)}
          >
            {item.name}
          </button>
        ))}
      </fieldset>
      <ul
        className="m-0 grid list-none grid-cols-2 gap-x-8 p-0 max-sm:grid-cols-1"
        aria-label="技术栈"
      >
        {skills
          .filter((skill) => category === 'all' || skill.category === category)
          .map((skill) => (
            <li className="flex gap-3 border-t border-line py-4" key={skill.name}>
              <span
                className="mt-1 flex size-8 shrink-0 items-center justify-center [&>svg]:size-6"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: skillIcons[skill.iconSlug] }}
              />
              <div className="min-w-0">
                <h3 className="m-0 text-balance text-sm font-bold">
                  {skill.name}
                  {skill.hot && <span className="ml-2 text-xs font-normal text-accent">重点</span>}
                </h3>
                <p className="mt-1 mb-0 text-pretty text-xs leading-6 text-muted">
                  {skill.description}
                </p>
              </div>
            </li>
          ))}
      </ul>
    </>
  )
}

export function RepositoryStats({
  repo,
  stars,
  forks
}: {
  repo: string
  stars: string
  forks: string
}) {
  const [stats, setStats] = useState({ stars, forks, live: false })

  useEffect(() => {
    const controller = new AbortController()
    fetch(`https://api.github.com/repos/${repo}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('GitHub stats unavailable')
        return response.json()
      })
      .then((data) => {
        if (!Number.isInteger(data.stargazers_count) || !Number.isInteger(data.forks_count)) return
        const format = new Intl.NumberFormat('en', {
          notation: 'compact',
          maximumFractionDigits: 1
        })
        setStats({
          stars: format.format(data.stargazers_count),
          forks: format.format(data.forks_count),
          live: true
        })
      })
      .catch(() => {})
    return () => controller.abort()
  }, [repo])

  return (
    <p className="mt-2 mb-0 font-mono text-xs text-muted tabular-nums">
      TypeScript · Star {stats.stars} · Fork {stats.forks}
      <span className="ml-2">{stats.live ? 'GitHub 数据' : '数据快照 · 2026-10-02'}</span>
    </p>
  )
}
