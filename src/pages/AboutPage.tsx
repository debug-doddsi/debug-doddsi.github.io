import { Smile } from 'lucide-react'
import { PageShell, SkeletonBlock } from '../components/ui/PageShell'
import { Interests } from '../components/ui/Interests.tsx'

export function AboutPage() {
  return (
    <PageShell
      title="Hello, I'm Iona."
      subtitle="TODO: Introduction"
      icon={<Smile size={28} />}
    >
      <div className="space-y-8">
        <SkeletonBlock label="TODO: Bio / intro paragraph" height="h-28" />
        <SkeletonBlock label="TODO: A photo, perhaps?" height="h-48" />

        <div>
          <h2 className="font-display text-xl text-neutral-100 mb-4">Interests</h2>
          <Interests />
        </div>
      </div>
    </PageShell>
  )
}
