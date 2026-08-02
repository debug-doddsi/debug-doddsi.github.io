import { Gallery } from "../ui/gallery";
import { StickyScroll } from "../ui/sticky-scroll-reveal";

// Each section can hold multiple photos now - drop real ones into each
// `cards` array (any placehold.co entries are stand-ins) and the gallery
// lets you flick between them without touching the layout.
const content = [
  {
    title: "Where It Started",
    description:
      "I have always gravitated towards technology. I remember asking my Dad at 12 years old about port forwarding, in an attempt to host a Minecraft server for my friends and I. I also remember him buying me a textbook on HTML after I asked how to build my own websites. (Turns out my Dad was pretty influential in my career path, and I owe him a lot for that.) I was always fascinated by how things worked, especially the \"magical\", invisible parts that power everything we know and love. That curiosity has never really left, and it's turned out to be a pretty useful tool.",
    content: (
      <Gallery
        compact
        autoplayDelay={0}
        cards={[
          {
            id: 1,
            imageUrl:
              "https://placehold.co/400x400/c66f80/ffffff?text=Photo+1",
            title: "Placeholder - swap for a childhood/early tech photo",
          },
          {
            id: 2,
            imageUrl:
              "https://placehold.co/400x400/c66f80/ffffff?text=Photo+2",
            title: "Placeholder - swap for another early tech photo",
          },
        ]}
      />
    ),
  },
  {
    title: "Biomedical Engineering",
    description:
      "Studying biomedical engineering at university was a major turning point, nurturing my two favourite subjects: biology and physics. It was my true entrypoint into the world of engineering. As much as I loved and excelled in the field, I was far too squeamish around blood, bodies and hospitals to actually work in medicine. I flirted with the idea of working on myoelectric prostheses and robotic surgical platforms, but deep down I knew I'd never get over the squeamishness enough to do a job like that justice. Let's just say I was grateful for being short-sighted during anatomy lectures.",
    content: (
      <Gallery
        compact
        autoplayDelay={0}
        cards={[
          {
            id: 1,
            imageUrl:
              "https://placehold.co/400x400/4a6644/ffffff?text=Photo+1",
            title: "Placeholder - swap for a university photo",
          },
          {
            id: 2,
            imageUrl:
              "https://placehold.co/400x400/4a6644/ffffff?text=Photo+2",
            title: "Placeholder - swap for a biomedical engineering photo",
          },
        ]}
      />
    ),
  },
  {
    title: "Into Software Engineering",
    description:
      "Luckily, software engineering doesn't usually involve blood. At university I loved the electronics-based projects I built with friends, where we learned problem solving, creativity and resilience the hard way. The reward was always exhilarating, and every late night was worth it. I loved the process of creating something and watching my ideas come to life. I knew I had to end up in research and development after graduation.",
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
            imageUrl:
              "https://placehold.co/400x400/9faa74/ffffff?text=Photo+2",
            title: "Placeholder - swap for another early career photo",
          },
        ]}
      />
    ),
  },
  {
    title: "My Creative Awakening",
description: "I never considered myself an artist. It's only been in the last few years that I've realised I'm creative in my own way. When I bought my first home, I took to interior design like a duck to water, choosing colours and textures to build a warm, happy space. Using the principles of Feng Shui to optimise my home turned out to be less about aesthetics and more about balance, proportion and flow, the same instincts I rely on every day as a UX designer. I realised my creativity was never about painting or drawing. It's about recognising patterns, understanding how colour and space affect how people feel, and using that to design something that just works.",    content: (
      <Gallery
        compact
        autoplayDelay={0}
        cards={[
          {
            id: 1,
            imageUrl:
              "https://placehold.co/400x400/f4c7d0/3d1220?text=Photo+1",
            title: "Placeholder - swap for a creative-work photo",
          },
          {
            id: 2,
            imageUrl:
              "https://placehold.co/400x400/f4c7d0/3d1220?text=Photo+2",
            title: "Placeholder - swap for another creative-work photo",
          },
        ]}
      />
    ),
  },
];

export function JourneyScroll() {
  return <StickyScroll content={content} />;
}
