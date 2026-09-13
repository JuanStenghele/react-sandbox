import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import BookCoverImagePicker from './CoverImagePicker';
import userEvent from '@testing-library/user-event';

describe('BookCoverImagePicker', () => {
  const onChangeMock = vi.fn();
  const onShowExternalImageChangeMock = vi.fn();

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    onChangeMock.mockClear();
    onShowExternalImageChangeMock.mockClear();
  });

  const buildControlledWrapper = (existingImageURL?: string) => {
    const TestComponent = () => {
      const [value, setValue] = useState<File | null>(null);
      const [showExternalImage, setShowExternalImage] = useState(existingImageURL !== undefined);
      return (
        <BookCoverImagePicker
          width={100.0}
          height={100.0}
          existingImageURL={existingImageURL}
          value={value}
          onChange={setValue}
          showExternalImage={showExternalImage}
          onShowExternalImageChange={setShowExternalImage}
        />
      );
    };
    return TestComponent;
  };

  it('renders an explanatory text when no existing image is provided', () => {
    render(
      <BookCoverImagePicker
        onChange={onChangeMock}
        width={100.0}
        height={100.0}
        showExternalImage={false}
        onShowExternalImageChange={onShowExternalImageChangeMock}
      />
    );

    const input = screen.getByLabelText('Cover image input');
    const image = screen.queryByAltText('Cover Image');
    const explanatoryText = screen.queryByText('Select a cover image...');

    expect(input).toBeInTheDocument();
    expect(image).toBeNull();
    expect(explanatoryText).toBeVisible();
  });

  it('renders an image when an existing image is provided', () => {
    render(
      <BookCoverImagePicker
        onChange={onChangeMock}
        width={100.0}
        height={100.0}
        existingImageURL="https://example.com/cover.jpg"
        showExternalImage={true}
        onShowExternalImageChange={onShowExternalImageChangeMock}
      />
    );

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

  it('restores the existing image when the user resets it', async () => {
    const Wrapper = buildControlledWrapper('https://example.com/cover.jpg');
    render(<Wrapper />);

    expect(screen.getByAltText('Cover Image')).toBeVisible();
    expect(screen.queryByTestId('reset-cover-image')).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('delete-cover-image'));

    expect(screen.queryByAltText('Cover Image')).toBeNull();
    expect(screen.getByTestId('reset-cover-image')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('reset-cover-image'));

    expect(screen.getByAltText('Cover Image')).toBeVisible();
    expect(screen.queryByTestId('reset-cover-image')).not.toBeInTheDocument();
  });
});
