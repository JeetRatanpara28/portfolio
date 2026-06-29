import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { getProjects } from '../../lib/api'

const ExternalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

const GithubSmIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
)

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
}

function ProjectCard({ project, index, inView }) {
  const accent = project.accent || '#64DCFF'
  return (
    <motion.div
      variants={fadeUp}
      custom={index + 2}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="glass rounded-2xl p-6 group relative overflow-hidden"
    >
      {/* Accent glow blob */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}22, transparent 70%)` }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          {project.label && (
            <span
              className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full mb-2 inline-block font-display"
              style={{
                background: `${accent}18`,
                color: accent,
                border: `1px solid ${accent}33`,
              }}
            >
              {project.label}
            </span>
          )}
          <h3 className="text-white font-bold font-display text-base">{project.title}</h3>
        </div>
        <div className="flex gap-2 flex-shrink-0 ml-3">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 glass rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <GithubSmIcon />
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 glass rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <ExternalIcon />
            </a>
          )}
        </div>
      </div>

      <p className="text-slate-400 text-sm leading-relaxed mb-4 font-body">{project.description}</p>

      {/* Tech tags */}
      <div className="flex flex-wrap gap-1.5">
        {(project.tech || []).map((t) => (
          <span
            key={t}
            className="text-[10px] font-medium px-2 py-0.5 rounded-full font-display"
            style={{
              background: `${accent}10`,
              color: `${accent}cc`,
              border: `1px solid ${accent}22`,
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

export default function Projects() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [projects, setProjects] = useState([])

  useEffect(() => {
    getProjects().then(setProjects).catch(() => {})
  }, [])

  return (
    <section id="projects" ref={ref} className="px-10 lg:px-14 py-12 border-t border-white/5">
      <motion.p
        variants={fadeUp} custom={0} initial="hidden" animate={inView ? 'visible' : 'hidden'}
        className="text-[#64DCFF] text-xs font-semibold tracking-[0.18em] uppercase mb-3 font-display"
      >
        03 · Projects
      </motion.p>

      <motion.div
        variants={fadeUp} custom={1} initial="hidden" animate={inView ? 'visible' : 'hidden'}
        className="flex items-end justify-between mb-8"
      >
        <h2 className="text-3xl lg:text-4xl font-bold font-display text-white section-heading">
          Things I've built
        </h2>
        <a
          href="https://github.com/Jeetratanpara28"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-500 hover:text-[#64DCFF] transition-colors font-display hidden sm:block"
        >
          View all on GitHub →
        </a>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} inView={inView} />
        ))}
      </div>
    </section>
  )
}
