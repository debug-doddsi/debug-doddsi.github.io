import { TechLoop } from "./TechLoop";
import { Education } from "./Education";
import { GlassCard } from "../ui/GlassCard";

export function Bio() {
  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="font-display text-xl text-neutral-100 mb-4">How Did I Get Here?</h2>
        <p className="font-body text-xs text-neutral-400 leading-relaxed">
          <em className="text-sm">I have always gravitated towards technology.</em>
          <br/>
          I remember asking my Dad at 12 years old about port forwarding in an attempt to host a Minecraft server for my friends and I to play on.
          I also remember my Dad buying me a textbook on HTML as I asked about how to build my own websites. (Look at me now, Dad!)
          I was always fascinated by how things worked, especially the "magical", invisible aspects that power all the things we know and love.
          My curiosity and desire to understand everything around me has always been a strong driving force, and a useful tool.
          <br/>
          <br/>
          Studying biomedical engineering at university was a major turning point in my career, 
          nurturing my two favourite subjects of biology and physics. It was my true entrypoint
          to the world of engineering. As much as I loved and excelled in my chosen field, I was
          far too afraid of blood, bodies and hospitals to be able to pursue a career in medicine.
          I was considering working in the world of myoelectric prostheses and robotic surgical 
          platforms, but I knew I would not be able to get over my fear in order to be able to
          such a critical job properly. 
          <em> Let's just say, I was grateful for being short-sighted in my anatomy lectures.</em>
          <br/>
          <br/>
          Luckily, software engineering doesn't <em> usually</em> involve blood.
          At university I adored the electronics-based projects I completed with friends as we 
          learned problem solving, creativity and resilience. The reward was always exhilarating 
          and every tear was worth it. I loved the process of creating something and having my 
          ideas come to life. I knew I had to be in the research and development field after graduation.
          <br/>
          <br/>
          <em className="text-lg">& the rest is history!</em>

        </p>
      </GlassCard>

      <Education />

      {/* Tech Stack */}
      <GlassCard>
        <h3 className="font-display text-lg text-neutral-100 mb-3">
          Tech Stack
        </h3>
        <TechLoop />
      </GlassCard>
    </div>
  );
}
