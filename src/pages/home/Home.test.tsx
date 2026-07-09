import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from './Home'

describe('Home', () => {
  it('displays the drawer by default', () => {
    render(<Home />)

    expect(screen.getByText('Books')).toBeVisible()
  })

  it('toggles the drawer when the menu button is clicked', async () => {
    render(<Home />)

    const menuButton = screen.getByLabelText('menu')

    await userEvent.click(menuButton)
    expect(screen.queryByText('Books')).not.toBeVisible()

    await userEvent.click(menuButton)
    expect(screen.getByText('Books')).toBeVisible()
  })
})
