import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import BookCoverImagePicker from './CoverImagePicker';
import userEvent from '@testing-library/user-event';

describe('BookCoverImagePicker', () => {
  const onChangeMock = vi.fn();

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  });

  const buildControlledWrapper = () => {
    const TestComponent = () => {
      const [value, setValue] = useState<File | undefined>(undefined);
      return (
        <BookCoverImagePicker
          value={value}
          onChange={(file) => setValue(file ?? undefined)}
        />
      );
    };
    return TestComponent;
  };

  it('renders an explanatory text when no existing image is provided', () => {
    render(<BookCoverImagePicker onChange={onChangeMock} />);

    const input = screen.getByLabelText('Cover image input');
    const image = screen.queryByAltText('Cover Image');
    const explanatoryText = screen.queryByText('Select a cover image...');

    expect(input).toBeInTheDocument();
    expect(image).toBeNull();
    expect(explanatoryText).toBeVisible();
  });

  it('renders an image when an existing image is provided', () => {
    render(<BookCoverImagePicker onChange={onChangeMock} imageURL="https://example.com/cover.jpg" />);

    const image = screen.queryByAltText('Cover Image');
    const explanatoryText = screen.queryByText('Select a cover image...');

    expect(image).toBeVisible();
    expect(explanatoryText).toBeNull();
  });

  it('displays the image that the user selects from their local file system', async () => {
    const Wrapper = buildControlledWrapper();
    render(<Wrapper />);
    const dummyFile = new File(['data'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText('Cover image input') as HTMLInputElement;

    await userEvent.upload(input, dummyFile);

    const image = screen.queryByAltText('Cover Image');
    const explanatoryText = screen.queryByText('Select a cover image...');

    expect(image).toBeVisible();
    expect(explanatoryText).toBeNull();
  });

  it('removes the image when the user deletes it', async () => {
    const Wrapper = buildControlledWrapper();
    render(<Wrapper />);
    const dummyFile = new File(['data'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText('Cover image input') as HTMLInputElement;

    await userEvent.upload(input, dummyFile);
    expect(screen.getByAltText('Cover Image')).toBeVisible();

    await userEvent.click(screen.getByTestId('delete-cover-image'));

    expect(screen.queryByAltText('Cover Image')).toBeNull();
    expect(screen.queryByText('Select a cover image...')).toBeVisible();
  });
});
