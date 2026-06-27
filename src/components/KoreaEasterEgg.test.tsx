import { render, screen, act } from '@testing-library/react';
import { KoreaTrigger } from './KoreaEasterEgg';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

test('clicking the trigger rains 250 flags, then clears them after 10s', () => {
  const { container } = render(<KoreaTrigger>South Korea</KoreaTrigger>);
  const span = screen.getByText('South Korea');
  act(() => {
    span.click();
  });
  expect(container.querySelectorAll('.kr-flag')).toHaveLength(250);
  act(() => {
    vi.advanceTimersByTime(10000);
  });
  expect(container.querySelectorAll('.kr-flag')).toHaveLength(0);
});
