import { SkeletonBlock } from "./PageShell";
import { Experience } from "./Experience";
import { TechTicker } from "./TechTicker";

export function Bio() {
  return (
    <div className="space-y-8">
      <p className="font-body text-xs text-neutral-400 mt-1 leading-relaxed">
        After graduating with an MEng in Biomedical Engineering, I joined a
        large company as a Systems Engineer. I enjoyed the high-level
        perspective of the engineering work I was undertaking, but I missed
        coding. Driven by a desire to return to hands-on development, I sought
        out every software opportunity available and successfully transitioned
        into the Software team. Through the graduate scheme at my company, I
        built a strong technical foundation, grew in confidence, and embraced
        every challenge that came my way.
        <br />
        <br />
        I am an enthusiastic person with passion and curiosity at the core of
        everything I do. I am personable, creative and determined to produce
        high-quality and exciting work that people will love to use. Whenever
        possible, I engage in STEM events to show the next generation how
        exciting science can be.
        <br />
        <br />
        When I'm not at my desk, I'm usually baking, gaming, reading or annoying
        my husband.
      </p>

      <div className="bg-gradient-to-r from-accent to-transparent mt-4 w-24 h-px" />

      {/* Education */}
      <div>
        <h3 className="font-display text-lg text-neutral-100 mb-3">
          Education
        </h3>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <a
              href="https://www.strath.ac.uk/courses/undergraduate/biomedicalengineeringmeng/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm text-neutral-100 font-medium hover:text-accent hover:underline transition-colors"
            >
              MEng Biomedical Engineering
            </a>
            <img
              src="/strath.png"
              alt="University of Strathclyde"
              className="h-4 w-auto object-contain"
            />
          </div>
          <p className="font-body text-xs text-accent">
            Master of Engineering with Distinction
          </p>
          <p className="font-mono text-xs text-neutral-500">
            University of Strathclyde, 2017–2022
          </p>
        </div>
        <p className="font-body text-xs text-neutral-400 mt-1 leading-relaxed">
          A five-year integrated masters degree covering biomechanics,
          biomedical materials, electronics, anatomy & physiology, and medical
          device design, bridging engineering and healthcare. Specialised in
          electronics, software and instrumentation electives, covering
          microcontrollers, digital signal processing, image processing, control
          systems and biomedical electronics. This is where my love of tech
          began.
        </p>
      </div>

      {/* Experience */}
      <div>
        <h3 className="font-display text-lg text-neutral-100 mb-3">
          Experience
        </h3>
        <Experience />
      </div>

      {/* Tech Stack */}
      <div>
        <div>
          <h3 className="font-display text-lg text-neutral-100 mb-3">
            Tech Stack
          </h3>
          <TechTicker />
        </div>
      </div>

      {/* Currently Learning */}
      <div>
        <h3 className="font-display text-lg text-neutral-100 mb-3">
          Currently Learning
        </h3>
        <SkeletonBlock label="TODO: Currently learning" height="h-20" />
      </div>
    </div>
  );
}
