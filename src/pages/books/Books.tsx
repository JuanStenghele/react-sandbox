import { Box, Typography, Button, TextField, InputAdornment } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import BooksTable from './table/Table';
import { useNavigate } from 'react-router';
import { adminScope, ROUTES } from '../../constants';
import { useHasPermission } from '../../services/auth';
import { useDeleteBooks } from '../../services/books';
import { useAtom } from 'jotai';
import { booksTableState, type BooksTableState } from '../../state/books';
import SearchIcon from '@mui/icons-material/Search';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

const BooksPage = () => {
  const isUserAdmin = useHasPermission(adminScope);
  const navigate = useNavigate();
  const [tableState, setTableState] = useAtom(booksTableState);
  const { t } = useTranslation();

  const { mutate, isPending: isDeletePending } = useDeleteBooks();

  const onNewButtonClick = () => {
    navigate(ROUTES.newBook);
  };

  const isDeleteButtonDisabled = !isUserAdmin || tableState.selectedRowsIds.size === 0;

  const onDeleteButtonClick = () => {
    mutate({ ids: [...tableState.selectedRowsIds] });
  };

  const onSearchTermChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTableState((prev: BooksTableState) => ({
      ...prev,
      searchTerm: event.target.value,
      page: 0
    }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant='h4' gutterBottom>
        {t('books.title')}
      </Typography>
      <Box sx={{ mb: 2.0, display: 'flex', gap: 1.0 }}>
        <Button
          variant='contained'
          size='large'
          onClick={onNewButtonClick}
          startIcon={<AddRoundedIcon />}
          sx={{ width: 124.0 }}
          disabled={!isUserAdmin}
          disableElevation
        >
          {t('common.new')}
        </Button>
        <Button
          variant='contained'
          color='error'
          size='large'
          onClick={onDeleteButtonClick}
          startIcon={<DeleteIcon />}
          sx={{ width: 124.0 }}
          disabled={isDeleteButtonDisabled}
          loadingPosition='start'
          loading={isDeletePending}
          disableElevation
        >
          {t('common.delete')}
        </Button>
        <TextField
          value={tableState.searchTerm}
          placeholder={t('common.search')}
          variant='outlined'
          onChange={onSearchTermChange}
          sx={{
            width: 440.0,
            '& .MuiInputBase-root': {
              height: 48.0
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              )
            }
          }}
        />
      </Box>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <BooksTable />
      </Box>
    </Box>
  );
}

export default BooksPage
