import { EditorialSection } from "@/components/site/editorial-section"
import { StatCounter } from "@/components/site/stat-counter"

const stats = [
  { value: 15, suffix: "+", label: "Years of excellence" },
  { value: 500, suffix: "+", label: "Students trained" },
  { value: 50, suffix: "+", label: "State champions" },
  { value: 12, suffix: "", label: "National qualifiers" },
  { value: 6, suffix: "", label: "International-spec tables" },
  { value: 4, suffix: "", label: "Professional coaches" },
]

export function FactsAndFigures() {
  return (
    <EditorialSection
      id="stats"
      eyebrow="By the numbers"
      heading="Facts & Figures"
      dark
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
        {stats.map((s) => (
          <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
        ))}
      </div>
    </EditorialSection>
  )
}
