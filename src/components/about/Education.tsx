import { GlassCard } from "../ui/GlassCard";

export function Education() {
  return (
    <GlassCard>
      <h3 className="font-display text-lg text-neutral-100 mb-3">Education</h3>
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
            src="/images/strath.png"
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
        A five-year integrated masters degree covering biomechanics, biomedical
        materials, electronics, anatomy & physiology, and medical device design,
        bridging engineering and healthcare. Specialised in electronics,
        software and instrumentation electives, covering microcontrollers,
        digital signal processing, image processing, control systems and
        biomedical electronics. This is where my love of tech began.
      </p>
    </GlassCard>
  );
}
