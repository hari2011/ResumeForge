import { AppShell } from "@/components/app-shell";
import { marketTrends } from "@/data/market-trends";

export default function MarketTrendsPage() {
  return (
    <AppShell
      title="Market Trends Intelligence"
      subtitle="Use current hiring signals and top-skill changes to tailor resume strategy."
    >
      <section className="grid gap-4 md:grid-cols-2">
        {marketTrends.map((trend) => (
          <article key={trend.role} className="card p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="headline text-2xl">{trend.role}</h2>
              <span className="rounded-full bg-[#eaf7f4] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
                {trend.hiringMomentum}
              </span>
            </div>

            <p className="mt-3 text-[var(--ink-soft)]">{trend.summary}</p>
            <p className="mt-4 text-sm text-[var(--ink-soft)]">Salary range: {trend.salaryBandUsd}</p>

            <div className="mt-4">
              <p className="text-sm uppercase tracking-wide text-[var(--accent-alt)]">Top skills</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {trend.topSkills.map((skill) => (
                  <span key={skill} className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1 text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
