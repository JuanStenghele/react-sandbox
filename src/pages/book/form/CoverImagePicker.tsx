import { Box, Typography } from '@mui/material';
import ImageSearchRoundedIcon from '@mui/icons-material/ImageSearchRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { useRef, useState, type ChangeEvent } from 'react';

interface BookCoverImagePickerProps {
  width: number;
  height: number;
  existingImageURL?: string ;
  value?: File;
  onChange: (coverImage: File | null) => void;
}

const BookCoverImagePicker = (props: BookCoverImagePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showExternalImage, setShowExternalImage] = useState<boolean>(props.existingImageURL !== undefined);

  const onCoverImageSelected = (file: File) => {
    props.onChange(file);
  };

  const onDeleteCoverImageClicked = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (showExternalImage) {
      setShowExternalImage(false);
    } else if (props.value) {
      props.onChange(null);
    }
  };

  const getDisplayedImageURL = () => {
    if (props.value) {
      return URL.createObjectURL(props.value);
    } else if (showExternalImage && props.existingImageURL) {
      return props.existingImageURL;
    }
    return null;
  }

  const displayedImageURL: string | null = getDisplayedImageURL();

  return (
    <Box
      onClick={() => inputRef.current?.click()}
      sx={{
        width: props.width,
        height: props.height,
        border: '1px solid rgba(0, 0, 0, 0.23)',
        borderRadius: 1.0,
        '&:hover': {
          border: '1px solid rgba(0, 0, 0, 0.87)'
        },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 2.0,
        cursor: 'pointer'
      }}
    >
      <input
        aria-label='Cover image input'
        ref={inputRef}
        type='file'
        hidden
        onChange={(event: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
          const file = event.target.files?.[0];
          if (!file) return;
          onCoverImageSelected(file);
        }}
      />
      {
        displayedImageURL ? (
          <Box 
            sx={{
              position: 'relative',
              height: '100%',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Box
              component='img'
              src={displayedImageURL}
              alt='Cover Image'
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: 1.0,
                zIndex: 1
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 6.0,
                right: 6.0,
                zIndex: 2
              }}
              onClick={onDeleteCoverImageClicked}
            >
              <CancelRoundedIcon 
                data-testid='delete-cover-image'
                sx={{ color: 'rgba(0, 0, 0, 0.6)' }}
              />
            </Box>
          </Box>
        ) : (
          <>
            <ImageSearchRoundedIcon
              sx={{ color: 'rgba(0, 0, 0, 0.6)' }}
              fontSize='large'
            />
            <Typography 
              variant='body1'
              sx={{ color: 'rgba(0, 0, 0, 0.6)' }}
            >
              Select a cover image...
            </Typography>
          </>
        )
      }
    </Box>
  );
};

export default BookCoverImagePicker;
