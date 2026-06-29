import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { getProfile } from '../../lib/api'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
}

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {})
  }, [])

  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null) // null | 'loading' | 'success' | 'error'

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setStatus('loading')
    try {
      const res = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" ref={ref} className="px-10 lg:px-14 py-12 border-t border-white/5">
      {/* Label */}
      <motion.p
        variants={fadeUp} custom={0} initial="hidden" animate={inView ? 'visible' : 'hidden'}
        className="text-[#64DCFF] text-xs font-semibold tracking-[0.18em] uppercase mb-3 font-display"
      >
        05 · Contact
      </motion.p>

      <motion.h2
        variants={fadeUp} custom={1} initial="hidden" animate={inView ? 'visible' : 'hidden'}
        className="text-3xl lg:text-4xl font-bold font-display text-white mb-3 section-heading"
      >
        Let's work together
      </motion.h2>

      <motion.p
        variants={fadeUp} custom={2} initial="hidden" animate={inView ? 'visible' : 'hidden'}
        className="text-slate-400 text-[0.93rem] leading-relaxed mb-8 font-body max-w-md"
      >
        Have a project in mind, a role to fill, or just want to say hi?
        Drop a message below or reach out directly — I respond within 24 hours.
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <motion.form
          variants={fadeUp} custom={3} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          onSubmit={handleSubmit}
          className="lg:col-span-3 glass rounded-2xl p-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 text-xs font-medium font-display mb-1.5 block">
                Name
              </label>
              <input
                className="field"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="text-slate-500 text-xs font-medium font-display mb-1.5 block">
                Email
              </label>
              <input
                className="field"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-500 text-xs font-medium font-display mb-1.5 block">
              Message
            </label>
            <textarea
              className="field h-32"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell me about your project or opportunity…"
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="btn-primary"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Sending…' : 'Send message →'}
            </button>

            <AnimatePresence>
              {status === 'success' && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-emerald-400 text-sm font-medium font-body"
                >
                  ✓ Message sent!
                </motion.span>
              )}
              {status === 'error' && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-sm font-medium font-body"
                >
                  Something went wrong — try emailing directly.
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.form>

        {/* Contact links */}
        <motion.div
          variants={fadeUp} custom={4} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="lg:col-span-2 space-y-3"
        >
          {profile?.email && (
            <a href={`mailto:${profile.email}`}
              className="glass rounded-2xl p-4 flex items-center gap-4 hover:border-[#64DCFF]/25 transition-all duration-200 group block"
            >
              <div className="w-10 h-10 rounded-xl bg-[#64DCFF]/08 flex items-center justify-center text-[#64DCFF] flex-shrink-0 group-hover:bg-[#64DCFF]/14 transition-colors">
                <EmailIcon />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium font-display">Send an email</p>
                <p className="text-slate-500 text-xs truncate font-body">{profile.email}</p>
              </div>
            </a>
          )}
          {profile?.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
              className="glass rounded-2xl p-4 flex items-center gap-4 hover:border-[#64DCFF]/25 transition-all duration-200 group block"
            >
              <div className="w-10 h-10 rounded-xl bg-[#64DCFF]/08 flex items-center justify-center text-[#64DCFF] flex-shrink-0 group-hover:bg-[#64DCFF]/14 transition-colors">
                <LinkedinIcon />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium font-display">Connect on LinkedIn</p>
                <p className="text-slate-500 text-xs truncate font-body">{profile.linkedin.replace('https://', '')}</p>
              </div>
            </a>
          )}

          {/* Availability badge */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white text-sm font-semibold font-display">Available now</span>
            </div>
            <p className="text-slate-500 text-xs font-body leading-relaxed">
              Open to full‑time roles, freelance contracts & interesting collaborations.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
