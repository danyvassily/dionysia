import { Feather, BookOpen, Brain, Code, Globe } from 'lucide-react';

const pillars = [
  { icon: Brain, title: 'Intelligence Artificielle', description: "De Claude à Kimi K3, l'IA redéfinit notre rapport au code et à la création. Analyses techniques et perspectives stratégiques." },
  { icon: Code, title: 'Développement', description: 'Next.js, TypeScript, architectures modernes. Le code comme langage commun, le craftsmanship comme discipline.' },
  { icon: Globe, title: 'Politique Numérique', description: 'Régulation, souveraineté, éthique. Les décisions politiques façonnent le monde numérique de demain.' },
  { icon: BookOpen, title: 'Veille & Analyse', description: 'Au-delà du bruit, les signaux faibles qui annoncent les ruptures. La curiosité comme méthode.' },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-14 lg:py-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full h-px mb-8" style={{ background: 'var(--rule-strong)' }} />
        <div className="flex items-center gap-2 mb-8">
          <Feather className="w-4 h-4 text-[var(--accent-editorial)]" />
          <span className="overline text-[var(--accent-editorial)]">À propos</span>
        </div>
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-7">
            <h2 className="font-editorial text-[30px] lg:text-[40px] font-semibold leading-[1.02] tracking-[-0.03em] text-[var(--ink)]">
              Entre l'analyse<br /><span style={{ color: 'var(--accent-editorial)' }}>et l'enthousiasme</span>
            </h2>
            <div className="mt-6 space-y-4 font-sans text-[14.5px] leading-relaxed text-[var(--ink-muted)] max-w-[58ch]">
              <p><strong className="text-[var(--ink)] font-semibold">DIONYSIA</strong> est né d'une conviction : la pensée technologique mérite un cadre aussi exigeant que celui des grandes revues éditoriales.</p>
              <p>Comme les <em>Dionysies</em> athéniennes célébraient à la fois la raison et l'extase, ce blog navigue entre l'analyse froide des architectures et l'enthousiasme créatif des nouvelles technologies.</p>
              <p>Chaque article est une exploration — des agents IA aux régulations européennes, des frameworks aux enjeux géopolitiques.</p>
              <p>La veille et la préparation des textes peuvent être assistées par l’intelligence artificielle. La ligne éditoriale impose néanmoins des sources identifiables, l’attribution des citations et une distinction explicite entre faits, déclarations et analyse.</p>
              <p>Une erreur ou une précision à apporter ? <a href="mailto:danyvassiliakos@gmail.com?subject=Correction%20DIONYSIA" className="font-medium text-[var(--ink)] underline decoration-[var(--rule-strong)] underline-offset-4 hover:text-[var(--accent-editorial)]">Signaler une correction</a>.</p>
            </div>
            <div className="mt-6 pt-5 border-t flex items-center gap-3" style={{ borderColor: 'var(--rule)' }}>
              <span className="w-7 h-7 rounded-full bg-[var(--paper-soft)] border inline-flex items-center justify-center text-[10px] font-sans font-bold" style={{ borderColor: 'var(--rule)' }}>DV</span>
              <p className="font-sans text-sm text-[var(--ink-faint)]">Par <span className="text-[var(--ink)] font-medium">Dany Vassily</span> — développeur, veilleur, curieux.</p>
            </div>
          </div>
          <div className="lg:col-span-5 grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {pillars.map((p) => (
              <div key={p.title} className="group rounded-xl border p-4 hover:bg-[var(--paper-dark)] transition-colors" style={{ borderColor: 'var(--rule)' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-7 h-7 rounded-full bg-[var(--paper-soft)] border inline-flex items-center justify-center" style={{ borderColor: 'var(--rule)' }}>
                    <p.icon className="w-3.5 h-3.5 text-[var(--ink-muted)] group-hover:text-[var(--accent-editorial)] transition-colors" />
                  </span>
                  <h3 className="font-editorial text-[15px] font-semibold text-[var(--ink)]">{p.title}</h3>
                </div>
                <p className="font-sans text-[13px] leading-relaxed text-[var(--ink-muted)]">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
