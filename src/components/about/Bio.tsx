import { GlassCard } from "../ui/GlassCard";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";

export function Bio() {
  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="font-display text-xl text-neutral-100 mb-4">
          TODO: Section Title
        </h2>
        <p className="font-body text-xs text-neutral-400 leading-relaxed">
          <em className="text-lg">TODO: placeholder content goes here.</em>
        </p>
      </GlassCard>
      
      <GlassCard>
        <p className="font-body text-sm text-neutral-400 leading-relaxed">
          <em className="text-lg">
            My career so far has been a collage of happy accidents...
          </em>
        </p>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <Accordion type="single" collapsible>
            <AccordionItem value="technical" className="border-b-0">
              <AccordionTrigger className="hover:no-underline">
                <h2 className="font-display text-xl text-neutral-100">
                  My Technical Journey
                </h2>
              </AccordionTrigger>
              <AccordionContent>
                <p className="font-body text-xs text-neutral-400 leading-relaxed">
                  <em className="text-lg">
                    I have always gravitated towards technology.
                  </em>
                  <br />
                  <br />
                  I remember asking my Dad at 12 years old about port
                  forwarding, in an attempt to host a Minecraft server for my
                  friends and I. I also remember him buying me a textbook on
                  HTML after I asked how to build my own websites. (Turns out
                  my Dad was pretty influential in my career path, and I owe
                  him a lot for that.) I was always fascinated by how things
                  worked, especially the "magical", invisible parts that
                  power everything we know and love. That curiosity has
                  never really left, and it's turned out to be a pretty
                  useful tool.
                  <br />
                  <br />
                  Studying biomedical engineering at university was a major
                  turning point, nurturing my two favourite subjects: biology
                  and physics. It was my true entrypoint into the world of
                  engineering. As much as I loved and excelled in the field, I
                  was far too squeamish around blood, bodies and hospitals to
                  actually work in medicine. I flirted with the idea of
                  working on myoelectric prostheses and robotic surgical
                  platforms, but deep down I knew I'd never get over the
                  squeamishness enough to do a job like that justice.
                  <em>
                    {" "}
                    Let's just say I was grateful for being short-sighted
                    during anatomy lectures.
                  </em>
                  <br />
                  <br />
                  Luckily, software engineering doesn't <em>usually</em>{" "}
                  involve blood. At university I loved the electronics-based
                  projects I built with friends, where we learned problem
                  solving, creativity and resilience the hard way. The reward
                  was always exhilarating, and every late night was worth it.
                  I loved the process of creating something and watching my
                  ideas come to life, and I knew I had to end up in research
                  and development after graduation.
                  <br />
                  <br />
                  <em className="text-lg">& the rest is history!</em>
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </GlassCard>

        <GlassCard>
          <Accordion type="single" collapsible>
            <AccordionItem value="creative" className="border-b-0">
              <AccordionTrigger className="hover:no-underline">
                <h2 className="font-display text-xl text-neutral-100">
                  My Creative Journey
                </h2>
              </AccordionTrigger>
              <AccordionContent>
                <p className="font-body text-xs text-neutral-400 leading-relaxed">
                  <em className="text-lg">
                    TODO: your creative journey goes here.
                  </em>
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </GlassCard>
      </div>
    </div>
  );
}
