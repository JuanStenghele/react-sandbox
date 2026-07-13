import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from './Home'

describe('Home', () => {
  it('displays the drawer by default', () => {
    render(<HomePage />)

    expect(screen.getByText('Books')).toBeVisible()
  })

  it('toggles the drawer when the menu button is clicked', async () => {
    render(<HomePage />)

    const menuButton = screen.getByLabelText('menu')
    const drawer = document.querySelector('.MuiDrawer-root')

    await userEvent.click(menuButton)
    expect(drawer).toHaveStyle({ width: '0px' })

    await userEvent.click(menuButton)
    expect(drawer).toHaveStyle({ width: '200px' })
  })
})
