import { Box, IconButton, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ImageSearchRoundedIcon from '@mui/icons-material/ImageSearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import { useRef, type ChangeEvent } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { lightTheme } from '../../../constants';

interface BookCoverImagePickerProps {
  width: number;
  height: number;
  existingImageURL: string | null;
  showExternalImage: boolean;
  onShowExternalImageChange: (show: boolean) => void;
  value?: File | null;
  onChange: (coverImage: File | null) => void;
}

const BookCoverImagePicker = (props: BookCoverImagePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const theme = useTheme();
  const isLightMode = theme.palette.mode === lightTheme;

  const onCoverImageSelected = (file: File) => {
    props.onChange(file);
    props.onShowExternalImageChange(false);
  };

  const onDeleteCoverImageClicked = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (props.showExternalImage) {
      props.onShowExternalImageChange(false);
    } else if (props.value) {
      props.onChange(null);
    }
  };

  const getDisplayedImageURL = () => {
    if (props.value) {
      return URL.createObjectURL(props.value);
    } else if (props.showExternalImage && props.existingImageURL) {
      return props.existingImageURL;
    }
    return null;
  }

  const onResetCoverImageClicked = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (props.existingImageURL) {
      props.onShowExternalImageChange(true);
    }
  };

  const displayedImageURL: string | null = getDisplayedImageURL();

  return (
    <Box
      onClick={() => inputRef.current?.click()}
      sx={{
        width: props.width,
        height: props.height,
        border: '1px solid',
        borderColor: isLightMode ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
        borderRadius: 1.0,
        '&:hover': {
          borderColor: 'text.primary'
        },
        cursor: 'pointer'
      }}
    >
      <input
        aria-label={t('bookForm.coverImage.inputAlt')}
        ref={inputRef}
        type='file'
        accept='image/jpeg,image/png,image/webp'
        hidden
        onChange={(event: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
          const file = event.target.files?.[0];
          if (!file) return;
          if (file.size > 10 * 1024 * 1024 ) { // Max 10 MB
            event.target.value = '';
            enqueueSnackbar(t('bookForm.coverImage.tooLarge'), {
              variant: 'error'
            });
            return;
          }
          onCoverImageSelected(file);
        }}
      />
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
      {
        displayedImageURL ? (
          <>
            <Box
              component='img'
              src={displayedImageURL}
              alt={t('bookForm.coverImage.alt')}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: 1.0,
                zIndex: 1
              }}
            />
            <IconButton
              size='small'
              sx={{
                position: 'absolute',
                top: 10.0,
                right: 10.0,
                zIndex: 2,
                backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.3)'
                }
              }}
              onClick={onDeleteCoverImageClicked}
            >
              <ClearRoundedIcon
                data-testid='delete-cover-image'
                sx={{ 
                  color: isLightMode ? 'common.white' : 'common.black', 
                  fontSize: 16.0 
                }}
              />
            </IconButton>
          </>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: 2.0
              }}
            >
              <ImageSearchRoundedIcon
                sx={{ color: 'text.secondary' }}
                fontSize='large'
              />
              <Typography 
                variant='body1'
                sx={{ color: 'text.secondary' }}
              >
                {t('bookForm.coverImage.select')}
              </Typography>
            </Box>
            {
              props.existingImageURL && 
                <IconButton
                  size='small'
                  sx={{
                    position: 'absolute',
                    top: 10.0,
                    right: 10.0,
                    zIndex: 2,
                    backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.3)'
                    }
                  }}
                  onClick={onResetCoverImageClicked}
                >
                  <RestoreRoundedIcon
                    data-testid='reset-cover-image'
                    sx={{ 
                      color: isLightMode ? 'common.white' : 'common.black', 
                      fontSize: 16.0 
                    }}
                  />
                </IconButton>
            }
          </>
        )
      }
      </Box>
    </Box>
  );
};

export default BookCoverImagePicker;
