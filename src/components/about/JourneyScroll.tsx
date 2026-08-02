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
      'I have always gravitated towards technology. I remember asking my Dad at 12 years old about port forwarding, in an attempt to host a Minecraft server for my friends and I. I also remember him buying me a textbook on HTML after I asked how to build my own websites. (Turns out my Dad was pretty influential in my career path, and I owe him a lot for that.) I was always fascinated by how things worked, especially the "magical", invisible parts that power everything we know and love. That curiosity has never really left, and it\'s turned out to be a pretty useful tool.',
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
      "Studying biomedical engineering at university was a major turning point, nurturing my two favourite subjects: biology and physics. It was my true entrypoint into the world of engineering. As much as I loved and excelled in the field, I was far too afraid of blood, bodies and hospitals to actually work in medicine. I flirted with the idea of working on myoelectric prostheses and robotic surgical platforms, but deep down I knew my anxieties would not be capable of doing a job like that justice. Let's just say I was grateful for being short-sighted during anatomy lectures.",
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
      "Luckily, software engineering doesn't usually involve blood. At university, the electronics-based projects were where I truly came alive, building circuits with friends late into the night, debugging things that stubbornly refused to work, and learning problem solving, creativity and resilience the hard way. There's a particular kind of exhilaration in finally seeing a stubborn circuit spring to life after hours of troubleshooting, and every late night was worth it for that feeling alone. I loved the entire process: the messy middle, the small breakthroughs, and watching an idea go from a rough sketch to something real and working.",
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
      "I never considered myself an artist. It's only been in the last few years that I've realised I'm creative in my own way. When I bought my first home, I took to interior design like a duck to water, choosing colours and textures to build a warm, happy space. Using the principles of Feng Shui to optimise my home turned out to be less about aesthetics and more about balance, proportion and flow, the same instincts I rely on every day as a UX designer. I realised my creativity was never about painting or drawing. It's about recognising patterns, understanding how colour and space affect how people feel, and using that to your advantage.",
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
