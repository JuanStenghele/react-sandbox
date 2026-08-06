import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import UnauthorizedPage from './Unauthorized';

describe('UnauthorizedPage', () => {
  it('displays an unauthorized text and code', () => {
    render(<UnauthorizedPage />);

    const unauthorizedText = screen.getByText('Unauthorized Access');
    const unauthorizedCodeText = screen.getByText('403');

    expect(unauthorizedText).toBeVisible();
    expect(unauthorizedCodeText).toBeVisible();
  });
});
