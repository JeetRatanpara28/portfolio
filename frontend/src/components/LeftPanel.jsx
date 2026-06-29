import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThreeScene from "./ThreeScene";
import { getProfile } from "../lib/api";

const NAV = [
  { id: "about",    label: "About"    },
  { id: "skills",   label: "Skills"   },
  { id: "projects", label: "Projects" },
  { id: "resume",   label: "Resume"   },
  { id: "contact",  label: "Contact"  },
];

/* ── Typewriter hook ─────────────────────────────────── */
function useTypewriter(words, speed = 80, pause = 2000) {
  const [index, setIndex]     = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;
    if (subIndex === words[index].length + 1 && !deleting) {
      const t = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(t);
    }
    if (subIndex === 0 && deleting) {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
      return;
    }
    const t = setTimeout(
      () => setSubIndex((s) => s + (deleting ? -1 : 1)),
      deleting ? speed / 2 : speed,
    );
    return () => clearTimeout(t);
  }, [subIndex, deleting, index, words, speed, pause]);

  if (!words || words.length === 0) return "";
  return words[index].substring(0, subIndex);
}

/* ── Icons ───────────────────────────────────────────── */
const GithubIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const TwitterIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const EmailIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

/* ── Component ───────────────────────────────────────── */
export default function LeftPanel({ activeSection, onNavClick }) {
  const [profile, setProfile] = useState(null);
  const [copied, setCopied]   = useState(false);

  // Fetch profile from API on mount
  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => {}); // silently fall back to defaults
  }, []);

  const title = useTypewriter(
    profile?.titles || ["Full Stack Developer"],
    70,
    2200,
  );

  const copyEmail = () => {
    navigator.clipboard.writeText(profile?.email || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Three.js neural network */}
      <ThreeScene />

      {/* Depth gradient overlays */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#050A14]/70 via-transparent to-[#050A14]/80" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#050A14]/30 via-transparent to-[#050A14]/50" />

      {/* Profile card */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="glass-strong glow-cyan rounded-3xl p-7 w-full max-w-[290px] text-center"
        >
          {/* Avatar */}
          <div className="relative mx-auto mb-5 w-[72px] h-[72px]">
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#64DCFF] via-[#3BCFF5] to-[#8B5CF6] flex items-center justify-center text-2xl font-bold text-white font-display shadow-lg">
              JR
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#050A14] shadow-sm" />
          </div>

          {/* Name */}
          <h1 className="font-display text-xl font-bold text-white mb-0.5 tracking-tight">
            {profile?.name || "Jeet Ratanpara"}
          </h1>

          {/* Animated title */}
          <p className="text-[#64DCFF] text-sm font-medium h-5 mb-1 font-display">
            {title}<span className="animate-pulse">|</span>
          </p>

          {/* Location & status */}
          <p className="text-slate-500 text-xs mb-5 leading-relaxed">
            {profile?.location || "Rajkot, India"} · {profile?.status || "Open to work"}
          </p>

          {/* Divider */}
          <div className="w-full h-px bg-white/8 mb-4" />

          {/* Navigation */}
          <nav className="space-y-0.5 mb-4">
            {NAV.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl
                    text-sm font-medium font-display transition-all duration-200
                    ${active
                      ? "bg-[#64DCFF]/12 text-[#64DCFF]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}
                  `}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300 ${
                    active
                      ? "bg-[#64DCFF] shadow-[0_0_8px_rgba(100,220,255,0.9)]"
                      : "bg-slate-700"
                  }`} />
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="navLine"
                      className="ml-auto w-4 h-px bg-[#64DCFF]/60 rounded"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="w-full h-px bg-white/8 mb-4" />

          {/* Social links */}
          <div className="flex items-center justify-center gap-2">
            <a href={profile?.github || "#"} target="_blank" rel="noopener noreferrer" title="GitHub"
              className="w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-[#64DCFF] transition-all duration-200">
              <GithubIcon />
            </a>
            <a href={profile?.linkedin || "#"} target="_blank" rel="noopener noreferrer" title="LinkedIn"
              className="w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-[#64DCFF] transition-all duration-200">
              <LinkedinIcon />
            </a>
            <a href={profile?.twitter || "#"} target="_blank" rel="noopener noreferrer" title="Twitter / X"
              className="w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-[#64DCFF] transition-all duration-200">
              <TwitterIcon />
            </a>
            <button onClick={copyEmail} title="Copy email"
              className="w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-[#64DCFF] transition-all duration-200">
              <EmailIcon />
            </button>
          </div>

          {/* Download Resume */}
          {profile?.resume_exists && (
            <a
              href="/api/resume/download"
              download
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-display transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, rgba(100,220,255,0.12) 0%, rgba(139,92,246,0.12) 100%)',
                border: '1px solid rgba(100,220,255,0.25)',
                color: '#64DCFF',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(100,220,255,0.2) 0%, rgba(139,92,246,0.2) 100%)'}
              onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(100,220,255,0.12) 0%, rgba(139,92,246,0.12) 100%)'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download Resume
            </a>
          )}

          {/* Copied toast */}
          <AnimatePresence>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="mt-3 text-xs text-[#64DCFF] font-medium"
              >
                ✓ Email copied!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
