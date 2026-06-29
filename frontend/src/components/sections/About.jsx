import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getProfile } from "../../lib/api";

export default function About() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {});
  }, []);

  return (
    <section id="about" className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-8 h-px bg-gradient-to-r from-[#64DCFF] to-transparent" />
          About Me
        </h2>

        <div className="glass-strong rounded-2xl p-6 space-y-4">
          <p className="text-slate-300 leading-relaxed text-sm">
            {profile?.bio || "Loading…"}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="glass rounded-xl p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Location</p>
              <p className="text-sm text-slate-200 font-medium">{profile?.location || "—"}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Status</p>
              <p className="text-sm text-emerald-400 font-medium">{profile?.status || "—"}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Email</p>
              <p className="text-sm text-slate-200 font-medium truncate">{profile?.email || "—"}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Focus</p>
              <p className="text-sm text-slate-200 font-medium">
                {profile?.titles?.[0] || "—"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}