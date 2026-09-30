export const MAX_PINS = 10;
export const TOTAL_FRAMES = 10;
export const NORMAL_ROLLS_PER_FRAME = 2;
export const LAST_FRAME_ROLLS = 3;

export type Frame = {
  rolls: number[];
  score: number | null;
  cumulative: number | null;
  type?: 'strike' | 'spare' | 'open';
};

/**
 * Compute frames and scores from a flat list of rolls.
 * Returns up to 10 frames with per-frame score and cumulative total.
 */
export function computeFramesFromRolls(rolls: number[]): { frames: Frame[]; total: number } {
  const frames: Frame[] = [];
  let i = 0;

  // frames 1..9
  for (let f = 0; f < TOTAL_FRAMES - 1; f++) {
    if (i >= rolls.length) break;
    const first = rolls[i] ?? 0;

    if (first === MAX_PINS) {
      const bonus1 = rolls[i + 1] ?? 0;
      const bonus2 = rolls[i + 2] ?? 0;
      frames.push({ rolls: [MAX_PINS], score: MAX_PINS + bonus1 + bonus2, cumulative: null, type: 'strike' });
      i += 1;
    } else {
      const second = rolls[i + 1] ?? 0;
      const sum = first + second;
      if (sum === MAX_PINS) {
        const bonus = rolls[i + 2] ?? 0;
        frames.push({ rolls: [first, second], score: MAX_PINS + bonus, cumulative: null, type: 'spare' });
      } else {
        frames.push({ rolls: [first, second], score: sum, cumulative: null, type: 'open' });
      }
      i += NORMAL_ROLLS_PER_FRAME;
    }
  }

  // tenth frame: remaining rolls up to 3
  const lastRolls: number[] = [];
  while (i < rolls.length && lastRolls.length < LAST_FRAME_ROLLS) {
    lastRolls.push(rolls[i]);
    i += 1;
  }
  if (lastRolls.length > 0) {
    const sum = lastRolls.reduce((s, r) => s + (r ?? 0), 0);
    let type: Frame['type'] = 'open';
    if (lastRolls[0] === MAX_PINS) type = 'strike';
    else if ((lastRolls[0] ?? 0) + (lastRolls[1] ?? 0) === MAX_PINS) type = 'spare';
    frames.push({ rolls: lastRolls, score: sum, cumulative: null, type });
  }

  let cumulative = 0;
  for (const frame of frames) {
    cumulative += frame.score ?? 0;
    frame.cumulative = cumulative;
  }

  return { frames, total: frames.length ? frames[frames.length - 1].cumulative ?? 0 : 0 };
}

export function computeTotal(rolls: number[]): number {
  return computeFramesFromRolls(rolls).total;
}
