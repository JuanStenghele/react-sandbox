import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingPage from './Loading';

describe('LoadingPage', () => {
  it('displays a loading spinner', () => {
    render(<LoadingPage />);

    const spinner = screen.getByLabelText('loading-spinner');

    expect(spinner).toBeVisible();
  });
});
