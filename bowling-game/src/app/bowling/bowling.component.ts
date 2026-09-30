import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';

import { computeFramesFromRolls, Frame } from './score';

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
  readonly frameSlots = Array.from({ length: 10 }, (_, index) => index + 1);

  constructor() {
    this.loadFromStorage();
    this.recalculate();
  }

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

  getAllowedMax(): number {
    const rolls = [...this.rolls()];
    let i = 0;
    for (let f = 0; f < 9; f++) {
      if (i >= rolls.length) return 10;
      const first = rolls[i];
      if (first === 10) {
        i += 1;
        continue;
      }
      if (i + 1 >= rolls.length) {
        const max = 10 - (first ?? 0);
        return Math.max(0, Math.min(10, max));
      }
      i += 2;
    }
    return 10;
  }

  // Formatting helpers for the typical bowling scoreboard
  displayRolls(frame: Frame, idx: number): string[] {
    // frames 0..8 => show 2 cells, frame 9 (10th) => show 3 cells
    if (!frame) return idx < 9 ? ['', ''] : ['', '', ''];
    const rolls = frame.rolls || [];
    if (idx < 9) {
      const first = rolls[0];
      const second = rolls[1];
      if (first === 10) {
        return ['', 'X'];
      }
      const a = first ?? null;
      const b = second ?? null;
      const dispA = a === 0 ? '-' : (a === null ? '' : String(a));
      let dispB = '';
      if (b === null) dispB = '';
      else if ((a ?? 0) + (b ?? 0) === 10) dispB = '/';
      else dispB = b === 0 ? '-' : String(b);
      return [dispA, dispB];
    } else {
      // 10th frame
      const r0 = rolls[0] ?? null;
      const r1 = rolls[1] ?? null;
      const r2 = rolls[2] ?? null;
      const disp0 = r0 === 10 ? 'X' : (r0 === 0 ? '-' : (r0 === null ? '' : String(r0)));
      let disp1 = '';
      if (r1 === null) disp1 = '';
      else if (r0 === 10 && r1 === 10) disp1 = 'X';
      else if (r0 !== 10 && (r0 ?? 0) + (r1 ?? 0) === 10) disp1 = '/';
      else disp1 = r1 === 10 ? 'X' : (r1 === 0 ? '-' : String(r1));
      let disp2 = '';
      if (r2 === null) disp2 = '';
      else if (r2 === 10) disp2 = 'X';
      else if (r1 !== null && ((r1 !== 10) && ((r1 ?? 0) + (r2 ?? 0) === 10))) disp2 = '/';
      else disp2 = r2 === 0 ? '-' : String(r2);
      return [disp0, disp1, disp2];
    }
  }

  displayCumulative(frame: Frame): string {
    if (!frame || frame.cumulative == null) return '';
    return String(frame.cumulative);
  }
}
