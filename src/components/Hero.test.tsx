import { render, screen } from '@testing-library/react';
import { Hero } from './Hero';

test('Hero renders title and subtitle', () => {
  render(<Hero title="Education" subtitle="last updated: 2025/06/14" />);
  expect(screen.getByRole('heading', { name: 'Education' })).toBeInTheDocument();
  expect(screen.getByText('last updated: 2025/06/14')).toHaveClass('subtitle');
});
