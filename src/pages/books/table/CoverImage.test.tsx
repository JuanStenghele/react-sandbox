import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BooksTableCoverImage from './CoverImage';

describe('BooksTableCoverImage', () => {
  const url = 'http://localhost:8000/storage/covers/abc.jpg';
  const bookTitle = 'The Pragmatic Programmer';

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the image with the correct src', () => {
    render(<BooksTableCoverImage url={url} book_title={bookTitle} />);

    const img = screen.getByAltText(`cover of ${bookTitle}`);

    expect(img).toBeVisible();
    expect(img).toHaveAttribute('src', url);
  });

  it('opens the image in a new tab on click', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<BooksTableCoverImage url={url} book_title={bookTitle} />);

    fireEvent.click(screen.getByAltText(`cover of ${bookTitle}`));

    expect(openSpy).toHaveBeenCalledWith(url, '_blank');
  });

  it('opens the image in a new tab on aux click (middle-click)', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<BooksTableCoverImage url={url} book_title={bookTitle} />);

    const img = screen.getByAltText(`cover of ${bookTitle}`);
    fireEvent(img, new MouseEvent('auxclick', { bubbles: true, button: 1 }));

    expect(openSpy).toHaveBeenCalledWith(url, '_blank');
  });

  it('stops aux click propagation', () => {
    const parentHandler = vi.fn();
    render(
      <div onAuxClick={parentHandler}>
        <BooksTableCoverImage url={url} book_title={bookTitle} />
      </div>
    );

    const img = screen.getByAltText(`cover of ${bookTitle}`);
    fireEvent(img, new MouseEvent('auxclick', { bubbles: true, button: 1 }));

    expect(parentHandler).not.toHaveBeenCalled();
  });

  it('stops click propagation', () => {
    const parentHandler = vi.fn();
    render(
      <div onClick={parentHandler}>
        <BooksTableCoverImage url={url} book_title={bookTitle} />
      </div>
    );

    fireEvent.click(screen.getByAltText(`cover of ${bookTitle}`));

    expect(parentHandler).not.toHaveBeenCalled();
  });
});
