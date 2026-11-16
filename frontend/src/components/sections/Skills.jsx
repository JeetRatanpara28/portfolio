import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useSkillGroups } from "../../lib/store";

// Colors assigned by position — matches your 5 groups
const GROUP_COLORS = ["#61DAFB", "#68A063", "#336791", "#F97316", "#A78BFA"];

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
  const groups = useSkillGroups(); // fallback data first, API data once it arrives

  return (
    <section id="skills" ref={ref} className="px-5 sm:px-8 lg:px-14 py-10 lg:py-12 border-t border-white/5">
      <motion.p
        variants={fadeUp} custom={0} initial="hidden" animate={inView ? "visible" : "hidden"}
        className="text-[#64DCFF] text-xs font-semibold tracking-[0.18em] uppercase mb-3 font-display"
      >
        02 · Skills
      </motion.p>

      <motion.h2
        variants={fadeUp} custom={1} initial="hidden" animate={inView ? "visible" : "hidden"}
        className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white mb-8 section-heading"
      >
        What I work with
      </motion.h2>

      {/* Skill groups — simple tags, no percentages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
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
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill.id ?? skill.name}
                    className="text-xs font-medium px-3 py-1.5 rounded-full font-display"
                    style={{
                      background: `${color}14`,
                      color: `${color}ee`,
                      border: `1px solid ${color}33`,
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
