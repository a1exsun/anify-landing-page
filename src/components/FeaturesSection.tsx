import { getGlassClass } from "@/utils/useGlassFallback";

import aiImg from "@/assets/ai.png";
import advImg from "@/assets/adv.png";
import cmbImg from "@/assets/cmb.png";
import townImg from "@/assets/town.png";

const FEATURE_IMAGES: Record<string, string> = {
  ai: aiImg,
  adv: advImg,
  cmb: cmbImg,
  town: townImg,
};

const FEATURES = [
  {
    id: "ai",
    name: "AI companion",
    description:
      "Persistent NPC agents carry memory and relationship state across sessions.",
    image: "ai",
    meta: "Memory and relationship state",
  },
  {
    id: "adv",
    name: "Adventure",
    description:
      "Branching objectives and rising stakes drive each run forward.",
    image: "adv",
    meta: "Goals, risk, and discovery",
  },
  {
    id: "cmb",
    name: "Combat",
    description:
      "Combat grows out of the world state, not a separate mode.",
    image: "cmb",
    meta: "World-state driven encounters",
  },
  {
    id: "town",
    name: "Town exploration",
    description:
      "Towns work as persistent hubs with shops, guilds, and changing routines.",
    image: "town",
    meta: "Persistent hubs and routines",
  },
];

export function FeaturesSection() {
  const glassClass = getGlassClass();

  return (
    <section
      id="features"
      className="relative w-full min-w-0 px-4 pb-16 pt-[max(calc(3.25rem+3rem+env(safe-area-inset-top)),env(safe-area-inset-top))] sm:px-6 sm:pb-20 md:px-8 md:pb-24 lg:px-10"
    >
      <header className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-5xl flex-col items-center justify-center text-center">
        <p className="text-xs font-semibold uppercase text-cyan-100/70 sm:text-[0.8rem]">
          Features
        </p>
        <h2
          className="mx-auto mt-4 max-w-4xl text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl lg:text-[3.5rem]"
          style={{ fontFamily: "var(--font-sans)", letterSpacing: 0 }}
        >
          Forge bonds in the tavern, legends in the fray.
        </h2>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 sm:gap-10 md:gap-12">
        {FEATURES.map((feature, index) => (
          <article
            id={`feature-${feature.id}`}
            key={feature.id}
            className={`${glassClass} grid min-h-[calc(100svh-5rem)] min-w-0 grid-cols-1 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.045] shadow-[0_28px_90px_-50px_rgba(0,0,0,0.7)] lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:items-center ${
              index % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
            }`}
          >
            <div className="relative flex min-h-[18rem] items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-500/10 via-white/5 to-amber-500/10 sm:min-h-[24rem] lg:min-h-full">
              <img
                src={FEATURE_IMAGES[feature.image]}
                alt=""
                className="h-full w-full object-contain object-center"
                aria-hidden
              />
            </div>

            <div className="flex min-h-0 flex-col justify-center px-5 py-8 sm:px-7 md:px-10 lg:px-12 lg:py-14">
              <p className="text-[0.68rem] font-semibold uppercase text-cyan-100/62">
                {feature.meta}
              </p>
              <h3 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]">
                {feature.name}
              </h3>
              <p className="mt-5 max-w-xl text-base leading-8 text-white/72 md:text-lg md:leading-9">
                {feature.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
