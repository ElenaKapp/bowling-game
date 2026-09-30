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
  for (let f = 0; f < 9; f++) {
    if (i >= rolls.length) break;
    const first = rolls[i] ?? 0;
    if (first === 10) {
      // strike
      const bonus1 = rolls[i + 1] ?? 0;
      const bonus2 = rolls[i + 2] ?? 0;
      frames.push({ rolls: [10], score: 10 + bonus1 + bonus2, cumulative: null, type: 'strike' });
      i += 1;
    } else {
      const second = rolls[i + 1] ?? 0;
      const sum = first + second;
      if (sum === 10) {
        const bonus = rolls[i + 2] ?? 0;
        frames.push({ rolls: [first, second], score: 10 + bonus, cumulative: null, type: 'spare' });
      } else {
        frames.push({ rolls: [first, second], score: sum, cumulative: null, type: 'open' });
      }
      i += 2;
    }
  }

  // tenth frame: remaining rolls up to 3
  const lastRolls: number[] = [];
  while (i < rolls.length && lastRolls.length < 3) {
    lastRolls.push(rolls[i]);
    i += 1;
  }
  if (lastRolls.length > 0) {
    // compute 10th frame score simply as sum of its rolls
    const sum = lastRolls.reduce((s, r) => s + (r ?? 0), 0);
    let type: Frame['type'] = 'open';
    if (lastRolls[0] === 10) type = 'strike';
    else if ((lastRolls[0] ?? 0) + (lastRolls[1] ?? 0) === 10) type = 'spare';
    frames.push({ rolls: lastRolls, score: sum, cumulative: null, type });
  }

  // compute cumulative totals
  let cumulative = 0;
  for (let fi = 0; fi < frames.length; fi++) {
    const frame = frames[fi];
    // frame.score is already computed for the cases above
    const sc = frame.score ?? 0;
    cumulative += sc;
    frame.cumulative = cumulative;
  }

  return { frames, total: frames.length ? frames[frames.length - 1].cumulative ?? 0 : 0 };
}

export function computeTotal(rolls: number[]): number {
  return computeFramesFromRolls(rolls).total;
}

