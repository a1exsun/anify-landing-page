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
            className="relative min-h-[calc(100svh-5rem)] min-w-0 overflow-hidden rounded-2xl border border-white/12 bg-[#050810] shadow-[0_28px_90px_-50px_rgba(0,0,0,0.7)]"
          >
            <img
              src={FEATURE_IMAGES[feature.image]}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/68 via-black/18 to-black/14 lg:bg-gradient-to-r lg:from-black/62 lg:via-black/16 lg:to-black/18"
              aria-hidden
            />

            <div
              className={`relative z-10 flex min-h-[calc(100svh-5rem)] items-end p-4 sm:p-6 md:p-8 lg:items-center ${
                index % 2 === 1 ? "lg:justify-end" : "lg:justify-start"
              }`}
            >
              <div
                className={`${glassClass} w-full max-w-xl rounded-2xl border-white/18 bg-[#07101d]/45 px-5 py-6 shadow-[0_22px_70px_-36px_rgba(0,0,0,0.85)] sm:px-7 sm:py-7 md:px-8 md:py-8`}
              >
                <p className="text-[0.68rem] font-semibold uppercase text-cyan-100/72">
                  {feature.meta}
                </p>
                <h3 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]">
                  {feature.name}
                </h3>
                <p className="mt-5 max-w-xl text-base leading-8 text-white/78 md:text-lg md:leading-9">
                  {feature.description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
