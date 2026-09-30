import { Component, signal } from '@angular/core';
import { BowlingComponent } from './bowling/bowling.component';

@Component({
  selector: 'app-root',
  imports: [BowlingComponent],
  template: `<main><app-bowling></app-bowling></main>`,
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('bowling-game');
}
