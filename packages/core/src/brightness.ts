import { Idea } from './models';

const DAY = 86400000;

/**
 * How strongly a spark's age still counts toward its glow. Fresh sparks burn at
 * full strength and settle toward a floor rather than going dark.
 */
function ageWeight(createdAt: number, now: number): number {
  const ageDays = (now - createdAt) / DAY;
  if (ageDays < 0.05) return 1;
  if (ageDays < 1) return 0.8;
  if (ageDays < 7) return 0.55;
  return 0.4;
}

/**
 * A spark glows brighter the more you return to it and the more it connects to
 * others, dimmed gently by age. Never fully dark.
 */
export function brightnessFor(idea: Idea, linkCount: number, now: number = Date.now()): number {
  const visits = idea.visits || 0;
  const raw = 0.25 + visits * 0.16 + linkCount * 0.12;
  const b = raw * (0.55 + ageWeight(idea.createdAt, now) * 0.45);
  return Math.max(0.16, Math.min(1, b));
}

export type BrightnessLabel = 'GLOWING' | 'STEADY' | 'DRIFTING' | 'FADING';

export function brightnessLabel(brightness: number): BrightnessLabel {
  if (brightness >= 0.75) return 'GLOWING';
  if (brightness >= 0.5) return 'STEADY';
  if (brightness >= 0.3) return 'DRIFTING';
  return 'FADING';
}
