import { describe, it, expect } from 'vitest';
import { computeTotal } from './score';

describe('Bowling scoring', () => {
  it('all gutters -> 0', () => {
    const rolls: number[] = Array(20).fill(0);
    expect(computeTotal(rolls)).toBe(0);
  });

  it('all ones -> 20', () => {
    const rolls: number[] = Array(20).fill(1);
    expect(computeTotal(rolls)).toBe(20);
  });

  it('all spares (5,5) with final 5 -> 150', () => {
    const rolls: number[] = [];
    for (let i = 0; i < 10; i++) {
      rolls.push(5, 5);
    }
    // extra bonus roll
    rolls.push(5);
    expect(computeTotal(rolls)).toBe(150);
  });

  it('perfect game (12 strikes) -> 300', () => {
    const rolls: number[] = Array(12).fill(10);
    expect(computeTotal(rolls)).toBe(300);
  });

  it('single strike then 5 and 4 -> correct scoring', () => {
    // Frame1: strike (10) bonus 5+4 = 19
    // Frame2: 5 + 4 = 9
    // rest zeros
    const rolls = [10, 5, 4, ...Array(17).fill(0)];
    expect(computeTotal(rolls)).toBe(28);
  });

  it('random mixed game example', () => {
    // This is a realistic mixed game
    const rolls = [10, 9, 1, 5, 5, 7, 2, 10, 10, 10, 9, 0, 8, 2, 9, 1, 10];
    // Expected total for this sequence is 187
    expect(computeTotal(rolls)).toBe(187);
  });

  it('incomplete game (strike then single roll) should compute partial bonuses', () => {
    const rolls = [10, 5];
    // Frame1: 10 + 5 + 0 = 15, Frame2: 5 = 5 -> total 20
    expect(computeTotal(rolls)).toBe(20);
  });
});


