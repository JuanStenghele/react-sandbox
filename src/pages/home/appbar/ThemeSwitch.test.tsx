import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import ThemeSwitch from './ThemeSwitch';
import { theme as themeAtom } from '../../../state/home';
import { darkTheme, lightTheme, themeStorageKey } from '../../../constants';

const store = getDefaultStore();

describe('ThemeSwitch', () => {
  beforeEach(() => {
    store.set(themeAtom, lightTheme);
    localStorage.clear();
  });

  afterEach(() => {
    store.set(themeAtom, lightTheme);
    localStorage.clear();
  });

  it('renders the theme switch button', () => {
    render(<ThemeSwitch />);

    expect(screen.getByLabelText('theme')).toBeInTheDocument();
  });

  it('shows the dark mode icon when the current theme is light', () => {
    render(<ThemeSwitch />);

    expect(screen.getByTestId('DarkModeRoundedIcon')).toBeInTheDocument();
  });

  it('shows the light mode icon when the current theme is dark', () => {
    store.set(themeAtom, darkTheme);
    render(<ThemeSwitch />);

    expect(screen.getByTestId('LightModeRoundedIcon')).toBeInTheDocument();
  });

  it('switches to dark theme when clicked', () => {
    render(<ThemeSwitch />);

    fireEvent.click(screen.getByLabelText('theme'));

    expect(store.get(themeAtom)).toBe(darkTheme);
    expect(localStorage.getItem(themeStorageKey)).toBe(darkTheme);
  });

  it('switches back to light theme when clicked again', () => {
    store.set(themeAtom, darkTheme);
    render(<ThemeSwitch />);

    fireEvent.click(screen.getByLabelText('theme'));

    expect(store.get(themeAtom)).toBe(lightTheme);
    expect(localStorage.getItem(themeStorageKey)).toBe(lightTheme);
  });
});
