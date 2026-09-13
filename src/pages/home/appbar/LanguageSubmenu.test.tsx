import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import LanguageSubmenu from './LanguageSubmenu';
import { language as languageAtom } from '../../../state/home';

const store = getDefaultStore();

describe('LanguageSubmenu', () => {
  afterEach(() => {
    store.set(languageAtom, 'en');
  });

  it('displays the available languages when open', () => {
    render(
      <LanguageSubmenu
        anchorEl={document.body}
        open
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
  });

  it('marks the selected language with a check', () => {
    store.set(languageAtom, 'es');
    render(
      <LanguageSubmenu
        anchorEl={document.body}
        open
        onClose={vi.fn()}
      />
    );

    const spanishItem = screen.getByRole('menuitem', { name: 'Español' });
    expect(within(spanishItem).getByTestId('CheckRoundedIcon')).toBeInTheDocument();
  });

  it('selects a language and closes when an option is clicked', () => {
    const onClose = vi.fn();
    render(
      <LanguageSubmenu
        anchorEl={document.body}
        open
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByText('Español'));

    expect(store.get(languageAtom)).toBe('es');
    expect(onClose).toHaveBeenCalled();
  });
});
