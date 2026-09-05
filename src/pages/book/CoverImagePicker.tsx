import { Box, Typography } from '@mui/material';
import ImageSearchRoundedIcon from '@mui/icons-material/ImageSearchRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { useRef, useState, type ChangeEvent } from 'react';

interface CoverImagePickerProps {
  width?: number;
  height?: number;
}

const CoverImagePicker = (props: CoverImagePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const onCoverImageSelected = (file: File) => {
    setCoverImage(file);
  };

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
        coverImage ? (
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
              src={URL.createObjectURL(coverImage)}
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
              onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                event.stopPropagation();
                setCoverImage(null);
              }}
            >
              <CancelRoundedIcon 
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
