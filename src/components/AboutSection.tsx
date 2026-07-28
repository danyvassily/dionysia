import { Feather, BookOpen, Brain, Code, Globe } from 'lucide-react';

const pillars = [
  {
    icon: Brain,
    title: 'Intelligence Artificielle',
    description: "De Claude à Kimi K3, l'IA redéfinit notre rapport au code et à la création. Analyses techniques et perspectives stratégiques.",
  },
  {
    icon: Code,
    title: 'Développement',
    description: 'Next.js, TypeScript, architectures modernes. Le code comme langage commun, le craftsmanship comme discipline.',
  },
  {
    icon: Globe,
    title: 'Politique Numérique',
    description: "Régulation, souveraineté, éthique. Les décisions politiques d'aujourd'hui façonnent le monde numérique de demain.",
  },
  {
    icon: BookOpen,
    title: 'Veille & Analyse',
    description: "Au-delà du bruit, les signaux faibles qui annoncent les ruptures. La curiosité comme méthode d'investigation.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section header with double rule */}
        <div className="mb-12">
          <div className="w-full mb-6" style={{ borderTop: '3px double var(--rule)' }} />
          <div className="flex items-center gap-3 mb-6">
            <Feather className="w-4 h-4 text-[var(--accent-editorial)]" />
            <span className="overline text-[var(--accent-editorial)]">À propos</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: editorial text */}
          <div className="lg:col-span-7">
            <h2 className="font-editorial text-3xl lg:text-4xl xl:text-5xl font-semibold text-[var(--ink)] mb-6 leading-tight">
              Entre l'analyse<br />
              <span style={{ color: 'var(--accent-editorial)' }}>et l'enthousiasme</span>
            </h2>

            <div className="space-y-4 font-sans text-[var(--ink-muted)] leading-relaxed">
              <p>
                <strong className="text-[var(--ink)] font-medium">DIONYSIA</strong> est né d'une conviction :
                la pensée technologique mérite un cadre aussi exigeant que celui des grandes revues éditoriales.
                Ici, l'intelligence artificielle rencontre l'écriture, la veille stratégique rencontre l'esthétique.
              </p>
              <p>
                Comme les <em>Dionysies</em> athéniennes célébraient à la fois la raison et l'extase,
                ce blog navigue entre l'analyse froide des architectures système et l'enthousiasme
                créatif des nouvelles technologies.
              </p>
              <p>
                Chaque article est une exploration — des agents IA autonomes aux régulations européennes,
                des frameworks JavaScript aux enjeux géopolitiques du numérique.
              </p>
            </div>

            <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--rule)' }}>
              <p className="font-sans text-sm text-[var(--ink-faint)]">
                Rédigé par <span className="text-[var(--ink)] font-medium">Dany Vassily</span> — développeur, veilleur, curieux.
              </p>
            </div>
          </div>

          {/* Right: pillars */}
          <div className="lg:col-span-5 space-y-6">
            {pillars.map((pillar, i) => (
              <div
                key={pillar.title}
                className="group flex gap-4 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                  <pillar.icon className="w-4 h-4 text-[var(--ink-faint)] group-hover:text-[var(--accent-editorial)] transition-colors" />
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-semibold text-[var(--ink)] mb-1">
                    {pillar.title}
                  </h3>
                  <p className="font-sans text-sm text-[var(--ink-muted)] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
