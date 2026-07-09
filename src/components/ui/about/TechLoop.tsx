import { LogoLoop } from "../LogoLoop";
import { TECH_LOGO_ITEMS } from "./techIcons";

export function TechLoop() {
  return (
    <LogoLoop
      logos={TECH_LOGO_ITEMS}
      speed={60}
      direction="left"
      logoHeight={28}
      gap={40}
      fadeOut
      fadeOutColor="var(--bg-base)"
      scaleOnHover
      ariaLabel="Tech stack"
      className="pt-10"
    />
  );
}
