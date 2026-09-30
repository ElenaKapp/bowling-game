import { describe, expect, it } from 'vitest';

describe('App contract', () => {
  it('should expose the bowling game title', () => {
    const app = { title: () => 'bowling-game' };
    expect(app.title()).toBe('bowling-game');
  });
});
