import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';

import {
  computeFramesFromRolls,
  Frame,
  LAST_FRAME_ROLLS,
  MAX_PINS,
  NORMAL_ROLLS_PER_FRAME,
  TOTAL_FRAMES
} from './score';

@Component({
  selector: 'app-bowling',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatTableModule
  ],
  templateUrl: './bowling.component.html',
  styleUrls: ['./bowling.component.scss']
})
export class BowlingComponent {
  // localStorage key for persistence
  private storageKey = 'bowling_game_rolls_v1';
  readonly frameSlots = Array.from({ length: TOTAL_FRAMES }, (_, index) => index + 1);

  constructor() {
    this.loadFromStorage();
    this.recalculate();
  }

  lastFrameIndex = TOTAL_FRAMES - 1;
  maxPins = MAX_PINS;
  rollInput = signal<string>('');
  rolls = signal<number[]>([]);
  frames = signal<Frame[]>([]);
  total = signal<number>(0);

  addRoll() {
    const v = parseInt(this.rollInput(), 10);
    const max = this.getAllowedMax();
    if (Number.isNaN(v) || v < 0 || v > max) return;
    const current = [...this.rolls()];
    current.push(v);
    this.rolls.set(current);
    this.rollInput.set('');
    this.recalculate();
  }

  removeLast() {
    const current = [...this.rolls()];
    current.pop();
    this.rolls.set(current);
    this.recalculate();
  }

  reset() {
    this.rolls.set([]);
    this.frames.set([]);
    this.total.set(0);
    this.rollInput.set('');
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      // ignore storage errors
    }
  }

  recalculate() {
    const rolls = [...this.rolls()];
    const { frames, total } = computeFramesFromRolls(rolls);
    this.frames.set(frames as any);
    this.total.set(total);
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.rolls()));
    } catch (e) {
      // ignore storage errors
    }
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const arr = JSON.parse(raw) as number[];
        if (Array.isArray(arr)) this.rolls.set(arr);
      }
    } catch (e) {
      // ignore
    }
  }

  // calculate the maximum allowed roll for the current frame
  getAllowedMax(): number {
    const rolls = [...this.rolls()];
    let i = 0;
    for (let f = 0; f < TOTAL_FRAMES - 1; f++) {
      if (i >= rolls.length) return MAX_PINS;
      const first = rolls[i];
      if (first === MAX_PINS) {
        i += 1;
        continue;
      }
      if (i + 1 >= rolls.length) {
        const max = MAX_PINS - (first ?? 0);
        return Math.max(0, Math.min(MAX_PINS, max));
      }
      i += NORMAL_ROLLS_PER_FRAME;
    }
    return MAX_PINS;
  }

  // format roll values for display in the scoreboard, using standard bowling notation
  private formatRoll(value: number | null): string {
    if (value === null) return '';
    if (value === 0) return '-';
    if (value === MAX_PINS) return 'X';
    return String(value);
  }

  // format the second roll in a frame, taking into account the first roll
  private formatSecondRoll(first: number | null, second: number | null): string {
    if (second === null) return '';
    if (first === MAX_PINS && second === MAX_PINS) return 'X';
    if (first !== MAX_PINS && (first ?? 0) + (second ?? 0) === MAX_PINS) return '/';
    if (second === MAX_PINS) return 'X';
    if (second === 0) return '-';
    return String(second);
  }

  // Formatting helpers for the typical bowling scoreboard
  displayRolls(frame: Frame, rollIndex: number): string[] {
    // frames 0..8 => show 2 cells, frame 9 (10th) => show 3 cells
    if (!frame) {
      return rollIndex < TOTAL_FRAMES - 1 ? Array(NORMAL_ROLLS_PER_FRAME).fill('') : Array(LAST_FRAME_ROLLS).fill('');
    }

    const rolls = frame.rolls || [];
    if (rollIndex < TOTAL_FRAMES - 1) {
      const [first, second] = [rolls[0] ?? null, rolls[1] ?? null];
      if (first === MAX_PINS) return ['X', ''];
      return [this.formatRoll(first), this.formatSecondRoll(first, second)];
    }

    const [r0, r1, r2] = [rolls[0] ?? null, rolls[1] ?? null, rolls[2] ?? null];
    const disp2 = (() => {
      if (r2 === null) return '';
      if (r2 === MAX_PINS) return 'X';
      if (r1 !== null && r1 !== MAX_PINS && (r1 ?? 0) + (r2 ?? 0) === MAX_PINS) return '/';
      return this.formatRoll(r2);
    })();

    return [this.formatRoll(r0), this.formatSecondRoll(r0, r1), disp2];
  }

  displayCumulative(frame: Frame): string {
    if (!frame || frame.cumulative == null) return '';
    return String(frame.cumulative);
  }
}
