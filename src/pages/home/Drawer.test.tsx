import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRoutesStub, MemoryRouter } from 'react-router';
import Drawer from './Drawer';
import { ROUTES } from '../../constants';

describe('HomeDrawer', () => {
  const RouterStub = createRoutesStub([
    {
      path: '/',
      Component: Drawer,
    },
    {
      path: ROUTES.authors,
      Component: () => <div>Authors Page</div>,
    },
    {
      path: ROUTES.books,
      Component: () => <div>Books Page</div>,
    },
  ]);

  it('displays the expected tabs', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Drawer />
      </MemoryRouter>
    );

    const authorsTab = screen.getByText('Authors');
    const booksTab = screen.getByText('Books');

    expect(booksTab).toBeVisible();
    expect(authorsTab).toBeVisible();
  });

  it('navigates to authors on click', async () => {
    render(<RouterStub initialEntries={['/']} />);

    await userEvent.click(screen.getByText('Authors'));

    expect(screen.getByText('Authors Page')).toBeVisible();
    expect(screen.queryByText('Books Page')).not.toBeInTheDocument();
  });

  it('navigates to books on click', async () => {
    render(<RouterStub initialEntries={['/']} />);

    await userEvent.click(screen.getByText('Books'));

    expect(screen.queryByText('Authors Page')).not.toBeInTheDocument();
    expect(screen.getByText('Books Page')).toBeVisible();
  });
});
