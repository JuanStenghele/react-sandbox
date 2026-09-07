import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CoverImagePicker from './CoverImagePicker';
import userEvent from '@testing-library/user-event';

describe('CoverImagePicker', () => {
  it('renders an explanatory text when no existing image is provided', () => {
    render(<CoverImagePicker />);

    const input = screen.getByLabelText('Cover image input');
    const image = screen.queryByAltText('Cover Image');
    const explanatoryText = screen.queryByText('Select a cover image...');

    expect(input).toBeInTheDocument();
    expect(image).toBeNull();
    expect(explanatoryText).toBeVisible();
  });

  it('renders an image when an existing image is provided', () => {
    render(<CoverImagePicker imageURL="https://example.com/cover.jpg" />);

    const image = screen.queryByAltText('Cover Image');
    const explanatoryText = screen.queryByText('Select a cover image...');

    expect(image).toBeVisible();
    expect(explanatoryText).toBeNull();
  });

  it('displays the image that the user selects from their local file system', async () => {
    render(<CoverImagePicker />);
    const dummyFile = new File(['data'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText('Cover image input') as HTMLInputElement;

    await userEvent.upload(input, dummyFile);

    const image = screen.queryByAltText('Cover Image');

    expect(image).toBeVisible();
  });
});
