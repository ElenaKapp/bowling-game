import { BowlingComponent } from './bowling.component';

describe('BowlingComponent', () => {
  let component: BowlingComponent;

  beforeEach(() => {
    component = new BowlingComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the usual 10 frame headers', () => {
    expect(component.frameSlots).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should calculate total for perfect game', () => {
    component.rolls.set(Array(12).fill(10));
    component.recalculate();
    expect(component.total()).toBe(300);
  });
});
