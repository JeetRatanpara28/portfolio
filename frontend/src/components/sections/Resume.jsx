import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { getExperience, getEducation, getCertifications, getProfile } from "../../lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

const BriefcaseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);

const GraduateIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const CertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

function TimelineItem({ title, subtitle, period, location, description, grade, current, index, inView }) {
  return (
    <motion.div
      variants={fadeUp} custom={index}
      initial="hidden" animate={inView ? "visible" : "hidden"}
      className="relative pl-6 pb-6 last:pb-0"
    >
      {/* Timeline line */}
      <div className="absolute left-0 top-2 bottom-0 w-px bg-white/8" />
      {/* Timeline dot */}
      <div className={`absolute left-[-4px] top-2 w-2 h-2 rounded-full border-2 ${
        current ? "border-[#64DCFF] bg-[#64DCFF]/30" : "border-slate-600 bg-[#050A14]"
      }`} />

      <div className="glass rounded-xl p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-white text-sm font-semibold font-display leading-snug">{title}</h4>
          {current && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#64DCFF]/12 text-[#64DCFF] border border-[#64DCFF]/25 flex-shrink-0 font-display">
              Current
            </span>
          )}
        </div>
        <p className="text-[#64DCFF] text-xs font-medium mb-1 font-display">{subtitle}</p>
        <div className="flex items-center gap-3 text-slate-500 text-xs mb-2 font-body">
          <span>{period}</span>
          {location && <><span>·</span><span>{location}</span></>}
          {grade && <><span>·</span><span className="text-slate-400">{grade}</span></>}
        </div>
        {description && (
          <p className="text-slate-400 text-xs leading-relaxed font-body">{description}</p>
        )}
      </div>
    </motion.div>
  );
}

function SectionBlock({ icon, title, children, custom, inView }) {
  return (
    <motion.div variants={fadeUp} custom={custom} initial="hidden" animate={inView ? "visible" : "hidden"}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#64DCFF]">{icon}</span>
        <h3 className="text-white text-sm font-bold font-display tracking-wide uppercase">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

export default function Resume() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const [experience, setExperience] = useState([]);
  const [education, setEducation]   = useState([]);
  const [certs, setCerts]           = useState([]);
  const [resumeUrl, setResumeUrl]   = useState(null);

  useEffect(() => {
    getExperience().then(setExperience).catch(() => {});
    getEducation().then(setEducation).catch(() => {});
    getCertifications().then(setCerts).catch(() => {});
    getProfile().then(p => setResumeUrl(p?.resume_exists ? '/api/resume/download' : null)).catch(() => {});
  }, []);

  return (
    <section id="resume" ref={ref} className="px-10 lg:px-14 py-12 border-t border-white/5">
      <motion.p
        variants={fadeUp} custom={0} initial="hidden" animate={inView ? "visible" : "hidden"}
        className="text-[#64DCFF] text-xs font-semibold tracking-[0.18em] uppercase mb-3 font-display"
      >
        04 · Resume
      </motion.p>

      <motion.div
        variants={fadeUp} custom={1} initial="hidden" animate={inView ? "visible" : "hidden"}
        className="flex items-end justify-between gap-4 mb-10"
      >
        <h2 className="text-3xl lg:text-4xl font-bold font-display text-white section-heading">
          Experience & Education
        </h2>
        {resumeUrl && (
          <a
            href={resumeUrl}
            download
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-display transition-all duration-200"
            style={{
              background: 'rgba(100,220,255,0.08)',
              border: '1px solid rgba(100,220,255,0.2)',
              color: '#64DCFF',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Resume
          </a>
        )}
      </motion.div>

      <div className="space-y-10">
        {/* Experience */}
        {experience.length > 0 && (
          <SectionBlock icon={<BriefcaseIcon />} title="Work Experience" custom={2} inView={inView}>
            <div>
              {experience.map((exp, i) => (
                <TimelineItem
                  key={exp.id}
                  title={exp.role}
                  subtitle={exp.company}
                  period={`${exp.start_date} – ${exp.end_date || "Present"}`}
                  location={exp.location}
                  description={exp.description}
                  current={!exp.end_date}
                  index={i + 3}
                  inView={inView}
                />
              ))}
            </div>
          </SectionBlock>
        )}

        {/* Education */}
        {education.length > 0 && (
          <SectionBlock icon={<GraduateIcon />} title="Education" custom={5} inView={inView}>
            <div>
              {education.map((edu, i) => (
                <TimelineItem
                  key={edu.id}
                  title={edu.degree}
                  subtitle={edu.institution}
                  period={`${edu.start_date} – ${edu.current ? "Present" : edu.end_date}`}
                  location={edu.location}
                  grade={edu.grade}
                  current={edu.current}
                  index={i + 6}
                  inView={inView}
                />
              ))}
            </div>
          </SectionBlock>
        )}

        {/* Certifications */}
        {certs.length > 0 && (
          <SectionBlock icon={<CertIcon />} title="Certifications" custom={10} inView={inView}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {certs.map((cert, i) => (
                <motion.div
                  key={cert.id}
                  variants={fadeUp} custom={i + 11}
                  initial="hidden" animate={inView ? "visible" : "hidden"}
                >
                  {cert.pdf_url ? (
                    <a
                      href={cert.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass rounded-xl p-3 flex items-center gap-3 hover:border-[#64DCFF]/25 transition-all group"
                    >
                      <span className="w-7 h-7 rounded-lg bg-[#64DCFF]/10 flex items-center justify-center text-[#64DCFF] flex-shrink-0 group-hover:bg-[#64DCFF]/20 transition-colors">
                        <CertIcon />
                      </span>
                      <span className="text-slate-300 text-xs font-medium font-display leading-snug">{cert.name}</span>
                    </a>
                  ) : (
                    <div className="glass rounded-xl p-3 flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[#64DCFF]/10 flex items-center justify-center text-[#64DCFF] flex-shrink-0">
                        <CertIcon />
                      </span>
                      <span className="text-slate-300 text-xs font-medium font-display leading-snug">{cert.name}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </SectionBlock>
        )}
      </div>
    </section>
  );
}
