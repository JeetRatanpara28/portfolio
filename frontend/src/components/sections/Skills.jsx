import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { getSkills } from "../../lib/api";

// Colors assigned by position — matches your 5 groups
const GROUP_COLORS = ["#61DAFB", "#68A063", "#336791", "#F97316", "#A78BFA"];

function SkillBar({ name, level, color, delay, inView }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-slate-300 text-sm font-body">{name}</span>
        <span className="text-slate-500 text-xs font-mono">{level}%</span>
      </div>
      <div className="skill-track">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}66)` }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : {}}
          transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    getSkills().then(setGroups).catch(() => {});
  }, []);

  return (
    <section id="skills" ref={ref} className="px-10 lg:px-14 py-12 border-t border-white/5">
      <motion.p
        variants={fadeUp} custom={0} initial="hidden" animate={inView ? "visible" : "hidden"}
        className="text-[#64DCFF] text-xs font-semibold tracking-[0.18em] uppercase mb-3 font-display"
      >
        02 · Skills
      </motion.p>

      <motion.h2
        variants={fadeUp} custom={1} initial="hidden" animate={inView ? "visible" : "hidden"}
        className="text-3xl lg:text-4xl font-bold font-display text-white mb-8 section-heading"
      >
        What I work with
      </motion.h2>

      {/* Skill groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {groups.map((group, gi) => {
          const color = GROUP_COLORS[gi % GROUP_COLORS.length];
          return (
            <motion.div
              key={group.id}
              variants={fadeUp}
              custom={gi + 2}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                />
                <span className="text-white text-sm font-semibold font-display">{group.name}</span>
              </div>
              <div className="space-y-4">
                {group.skills.map((skill, si) => (
                  <SkillBar
                    key={skill.id}
                    name={skill.name}
                    level={skill.level}
                    color={color}
                    delay={gi * 0.12 + si * 0.07}
                    inView={inView}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}