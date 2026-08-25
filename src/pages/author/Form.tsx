import { Box, Button, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../constants';
import { usePostAuthor } from '../../services/authors';

interface AuthorFormInput {
  name: string;
}

const AuthorForm = () => {
  const navigate = useNavigate();
  const { mutate, isPending } = usePostAuthor();

  const { control, handleSubmit, formState: { isValid } } = useForm<AuthorFormInput>({
    defaultValues: { name: '' },
  });

  const navigateToAuthorsPage = () => {
    navigate(ROUTES.authors);
  };

  const onSubmit: SubmitHandler<AuthorFormInput> = (data: AuthorFormInput) => {
    mutate(data, {
      onSuccess: () => {
        navigateToAuthorsPage();
      }
    });
  };

  return (
    <Box
      component='form'
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.0, height: '100%' }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Controller
          name='name'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              required
              label='Name'
              sx={{
                width: '100%',
                maxWidth: 726.0
              }}
            />
          )}
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2.0, justifyContent: 'flex-end' }}>
        <Button
          variant='outlined'
          size='large'
          startIcon={<CloseIcon />}
          sx={{ width: 148.0 }}
          onClick={navigateToAuthorsPage}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type='submit'
          variant='contained'
          size='large'
          startIcon={<SaveIcon />}
          sx={{ width: 148.0 }}
          disabled={!isValid}
          loadingPosition='start'
          loading={isPending}
          disableElevation
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default AuthorForm;
