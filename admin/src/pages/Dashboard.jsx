import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { FolderKanban, Wrench, Briefcase, GraduationCap, Award, ExternalLink, Fingerprint, X } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value ?? '—'}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats]           = useState({})
  const [showBioBanner, setShowBio] = useState(false)

  useEffect(() => {
    api.webauthnHasCredential('jeet')
      .then(({ has_credential }) => setShowBio(!has_credential))
      .catch(() => {})

    Promise.all([
      api.getProjects(),
      api.getSkills(),
      api.getExperience(),
      api.getEducation(),
      api.getCertifications(),
    ]).then(([projects, skills, experience, education, certs]) => {
      setStats({
        projects: projects?.length,
        skills: skills?.reduce((acc, g) => acc + g.skills.length, 0),
        experience: experience?.length,
        education: education?.length,
        certs: certs?.length,
      })
    })
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your portfolio content</p>
      </div>

      {/* Touch ID setup banner */}
      {showBioBanner && (
        <div className="mb-6 flex items-center gap-4 bg-primary/5 border border-primary/20 rounded-xl px-5 py-3.5">
          <Fingerprint size={18} className="text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Set up Touch ID / Face ID login</p>
            <p className="text-xs text-muted-foreground">Add biometric authentication for instant, secure access.</p>
          </div>
          <Link to="/setup-biometric"
            className="text-xs font-medium text-primary hover:underline flex-shrink-0">
            Set up →
          </Link>
          <button onClick={() => setShowBio(false)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={FolderKanban} label="Projects"       value={stats.projects}   color="bg-blue-50 text-blue-600" />
        <StatCard icon={Wrench}       label="Skills"         value={stats.skills}     color="bg-purple-50 text-purple-600" />
        <StatCard icon={Briefcase}    label="Experience"     value={stats.experience} color="bg-green-50 text-green-600" />
        <StatCard icon={GraduationCap}label="Education"      value={stats.education}  color="bg-orange-50 text-orange-600" />
        <StatCard icon={Award}        label="Certifications" value={stats.certs}      color="bg-pink-50 text-pink-600" />
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold text-sm text-foreground mb-3">Quick links</h2>
        <div className="space-y-2">
          <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
            <ExternalLink size={14} /> View portfolio (localhost:3000)
          </a>
          <a href="http://localhost:8000/api/docs" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
            <ExternalLink size={14} /> API docs (localhost:8000/api/docs)
          </a>
        </div>
      </div>
    </div>
  )
}
