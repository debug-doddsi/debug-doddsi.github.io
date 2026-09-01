import { Gallery } from "../ui/gallery";
import { PagedReveal } from "../ui/paged-reveal";

// Blank solid-colour swatch (no baked-in text/caption) - used as a stand-in
// until a real photo is dropped into a card's `imageUrl`.
function solidPlaceholder(hex: string) {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23${hex}'/%3E%3C/svg%3E`;
}

// Each section can hold multiple photos now - drop real ones into each
// `cards` array (any solidPlaceholder() entries are stand-ins) and the
// gallery lets you flick between them without touching the layout.
const content = [
  {
    title: "Dad Was Right",
    description:
      "I've always gravitated towards technology. At 12, I asked my Dad about port forwarding so I could host a Minecraft server for my friends. He responded by buying me a textbook on HTML. (Turns out he was pretty influential in my career path.) I was fascinated by how things worked, especially the \"magical\", invisible parts. That curiosity never really left, and it's turned out to be a pretty useful tool.",
    content: (
      <Gallery
        compact
        autoplayDelay={0}
        cards={[
          {
            id: 1,
            imageUrl: solidPlaceholder("c66f80"),
            title: "Placeholder - swap for a childhood/early tech photo",
          },
          {
            id: 2,
            imageUrl: solidPlaceholder("c66f80"),
            title: "Placeholder - swap for another early tech photo",
          },
        ]}
      />
    ),
  },
  {
    title: "Biomedical Engineering",
    description:
      "Studying biomedical engineering was a major turning point, my true entrypoint into engineering, blending my two favourite subjects: biology and physics. I loved it, but I was far too squeamish about blood and hospitals to actually work in medicine. I flirted with the idea of building prosthetics and surgical robots, but deep down knew my anxieties couldn't do that job justice. Let's just say I was grateful for being short-sighted during anatomy lectures.",
    content: (
      <Gallery
        compact
        autoplayDelay={0}
        cards={[
          {
            id: 1,
            imageUrl: "/images/grad-2022.png",
            imagePosition: "center bottom",
          },
          {
            id: 2,
            imageUrl: "/images/uni-proj.png",
          },
        ]}
      />
    ),
  },
  {
    title: "Into Software Engineering",
    description:
      "Luckily, software engineering doesn't usually involve blood. The electronics projects were where I truly came alive: building circuits with friends late into the night, debugging things that stubbornly refused to work, and learning resilience the hard way. There's nothing quite like the exhilaration of a stubborn circuit finally springing to life. I loved the whole process, the messy middle, the small breakthroughs, watching an idea go from a rough sketch to something real.",
    content: (
      <Gallery
        compact
        autoplayDelay={0}
        cards={[
          {
            id: 1,
            imageUrl: "/images/uni-proj.png",
            title:
              "A university electronics project - an Arduino-based build wired up on a breadboard",
          },
          {
            id: 2,
            imageUrl: solidPlaceholder("9faa74"),
            title: "Placeholder - swap for another early career photo",
          },
        ]}
      />
    ),
  },
  {
    title: "My Creative Awakening",
    description:
      "I never considered myself an artist, until I realised I'm creative in my own way. When I bought my first home, I took to interior design like a duck to water, choosing colours and textures to build a warm, happy space. Using Feng Shui to optimise it turned out to be less about aesthetics and more about balance and flow, the same instincts I rely on every day as a UX designer. My creativity was never about painting or drawing. It's about recognising patterns and understanding how colour and space affect how people feel.",
    content: (
      <Gallery
        compact
        autoplayDelay={0}
        cards={[
          {
            id: 1,
            imageUrl: solidPlaceholder("f4c7d0"),
            title: "Placeholder - swap for a creative-work photo",
          },
          {
            id: 2,
            imageUrl: solidPlaceholder("f4c7d0"),
            title: "Placeholder - swap for another creative-work photo",
          },
        ]}
      />
    ),
  },
];

export function JourneyScroll() {
  return <PagedReveal items={content} />;
}
