import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Drawer from './Drawer';

describe('HomeDrawer', () => {
  it('displays the expected tabs', () => {
    render(<Drawer />)

    const booksTab = screen.getByText('Books')

    expect(booksTab).toBeVisible()
  })
})
