import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotFoundPage from './NotFound';

describe('NotFoundPage', () => {
  it('displays a not found text and code', () => {
    render(<NotFoundPage />);

    const notFoundText = screen.getByText('Page Not Found');
    const notFoundCodeText = screen.getByText('404');

    expect(notFoundText).toBeVisible();
    expect(notFoundCodeText).toBeVisible();
  });
});
