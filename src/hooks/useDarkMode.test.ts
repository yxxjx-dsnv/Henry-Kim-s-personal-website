import { renderHook, act } from '@testing-library/react';
import { useDarkMode } from './useDarkMode';

beforeEach(() => {
  localStorage.clear();
  document.body.className = '';
});

test('defaults to light when nothing stored and system is light', () => {
  const { result } = renderHook(() => useDarkMode());
  expect(result.current.theme).toBe('light');
  expect(document.body.classList.contains('dark-mode')).toBe(false);
});

test('reads a stored dark theme and applies the body class', () => {
  localStorage.setItem('theme', 'dark');
  const { result } = renderHook(() => useDarkMode());
  expect(result.current.isDark).toBe(true);
  expect(document.body.classList.contains('dark-mode')).toBe(true);
});

test('toggle flips theme, body class, and persists', () => {
  const { result } = renderHook(() => useDarkMode());
  act(() => result.current.toggle());
  expect(result.current.theme).toBe('dark');
  expect(document.body.classList.contains('dark-mode')).toBe(true);
  expect(localStorage.getItem('theme')).toBe('dark');
});
