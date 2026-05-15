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
        {FEATURES.map((feature) => (
          <article
            id={`feature-${feature.id}`}
            key={feature.id}
            className={`${glassClass} flex min-w-0 flex-col gap-4 overflow-hidden rounded-2xl border-white/14 bg-[#07101d]/42 p-3 pb-5 shadow-[0_28px_90px_-50px_rgba(0,0,0,0.7)] sm:p-4 sm:pb-6 md:p-5 md:pb-7`}
          >
            <div className="h-[clamp(18rem,58svh,34rem)] overflow-hidden rounded-xl bg-black/20 md:h-[clamp(22rem,62svh,42rem)]">
              <img
                src={FEATURE_IMAGES[feature.image]}
                alt=""
                className="h-full w-full object-cover object-center"
                aria-hidden
              />
            </div>

            <div className="flex shrink-0 flex-col gap-2 px-1 pb-1 sm:px-2 md:flex-row md:items-end md:justify-between md:gap-6 md:px-3">
              <div className="min-w-0 md:w-[34%]">
                <p className="text-[0.68rem] font-semibold uppercase text-cyan-100/72">
                  {feature.meta}
                </p>
                <h3 className="mt-1 text-xl font-semibold leading-tight text-white sm:text-2xl md:text-3xl">
                  {feature.name}
                </h3>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-white/78 sm:text-base md:flex-1 md:leading-7">
                {feature.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
