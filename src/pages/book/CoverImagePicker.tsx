import { Box, Typography } from '@mui/material';
import ImageSearchRoundedIcon from '@mui/icons-material/ImageSearchRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { useRef, useState, type ChangeEvent } from 'react';

interface CoverImagePickerProps {
  width?: number;
  height?: number;
  imageURL?: string;
}

const CoverImagePicker = (props: CoverImagePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showExternalImage, setShowExternalImage] = useState<boolean>(props.imageURL !== undefined);
  const [localCoverImage, setLocalCoverImage] = useState<File | null>(null);

  const onCoverImageSelected = (file: File) => {
    setLocalCoverImage(file);
  };

  const onDeleteCoverImageClicked = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (showExternalImage) {
      setShowExternalImage(false);
    } else if (localCoverImage) {
      setLocalCoverImage(null);
    }
  };

  const getDisplayedImageURL = () => {
    if (localCoverImage) {
      return URL.createObjectURL(localCoverImage);
    } else if (props.imageURL) {
      return props.imageURL;
    }
    return null;
  }

  const displayedImageURL: string | null = getDisplayedImageURL();

  return (
    <Box
      onClick={() => inputRef.current?.click()}
      sx={{
        width: props.width || 300.0,
        height: props.height || 400.0,
        border: '2px solid #D3D3D3',
        borderRadius: 2.0,
        borderStyle: 'dashed',
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
                height: '100%',
                objectFit: 'cover',
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
                sx={{ color: '#A9A9A9' }}
              />
            </Box>
          </Box>
        ) : (
          <>
            <ImageSearchRoundedIcon
              sx={{ color: '#A9A9A9' }}
              fontSize='large'
            />
            <Typography 
              variant='body1'
              sx={{ color: '#A9A9A9' }}
            >
              Select a cover image...
            </Typography>
          </>
        )
      }
    </Box>
  );
};

export default CoverImagePicker;
