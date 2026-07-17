import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomeAppBar from './AppBar';

describe('HomeAppBar', () => {
  it('displays the app name and the menu button', () => {
    render(<HomeAppBar />)

    const appName = screen.getByText('React Sandbox')
    const menuButton = screen.getByLabelText('menu')

    expect(appName).toBeVisible()
    expect(menuButton).toBeVisible()
  })
})
