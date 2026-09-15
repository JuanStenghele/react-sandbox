import {
  DataGrid,
  GridOverlay,
  type GridColDef,
  type GridPaginationModel,
  type GridRowParams,
  type GridRowSelectionModel,
} from '@mui/x-data-grid';
import { useGetAuthors } from '../../../services/authors';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import ErrorIcon from '@mui/icons-material/Error';
import { Typography } from '@mui/material';
import { useAtom } from 'jotai';
import { authorsTableState, type AuthorsTableState } from '../../../state/authors';
import { generatePath, useNavigate } from 'react-router';
import { ROUTES } from '../../../constants';
import { useDebounce } from 'use-debounce';
import { useTranslation } from 'react-i18next';

const AuthorsTable = () => {
  const navigate = useNavigate();
  const [tableState, setTableState] = useAtom(authorsTableState);
  const [debouncedSearchTerm] = useDebounce(tableState.searchTerm, 300);
  const { t } = useTranslation();

  const { data, isFetching, isError } = useGetAuthors({
    search_term: debouncedSearchTerm,
    page: tableState.page + 1,
    page_size: tableState.pageSize
  });

  const columns: GridColDef[] = [
    { field: 'id', headerName: t('common.id'), width: 296.0 },
    { field: 'name', headerName: t('common.name'), width: 248.0 }
  ];

  const onRowClick = (params: GridRowParams) => {
    navigate(generatePath(ROUTES.editAuthor, { id: params.row.id }), { state: { author: params.row } });
  };

  const onRowSelected = (newSelectionModel: GridRowSelectionModel) => {
    setTableState((prev: AuthorsTableState) => ({
      ...prev,
      selectedRowsIds: new Set([...newSelectionModel.ids].map((id) => id.toString()))
    }));
  };

  const onPaginationChange = (model: GridPaginationModel) => {
    setTableState((prev: AuthorsTableState) => ({
      ...prev,
      page: model.page,
      pageSize: model.pageSize
    }));
  };

  const buildNoAuthorsFoundOverlay = () => {
    return (
      <GridOverlay>
        <WarningRoundedIcon sx={{ fontSize: 64 }}/>
        <Typography variant='h5'>
          {t('authors.noAuthorsFound')}
        </Typography>
      </GridOverlay>
    );
  };

  const buildLoadingErrorOverlay = () => {
    return (
      <GridOverlay>
        <ErrorIcon sx={{ fontSize: 64 }}/>
        <Typography variant='h5'>
          {t('authors.errorLoading')}
        </Typography>
      </GridOverlay>
    );
  };

  return (
    <DataGrid
      rows={data?.authors ?? []}
      rowHeight={64.0}
      columns={columns}
      loading={isFetching}
      rowCount={data?.total_authors ?? 0}
      paginationMode='server'
      paginationModel={{
        page: tableState.page,
        pageSize: tableState.pageSize
      }}
      onPaginationModelChange={onPaginationChange}
      pageSizeOptions={[10, 20, 50, 100]}
      localeText={{
        paginationRowsPerPage: t('common.rowsPerPage')
      }}
      slots={{
        noRowsOverlay: isError ? buildLoadingErrorOverlay : buildNoAuthorsFoundOverlay
      }}
      slotProps={{
        loadingOverlay: {
          variant: 'skeleton',
          noRowsVariant: 'skeleton'
        }
      }}
      checkboxSelection
      disableRowSelectionOnClick
      disableRowSelectionExcludeModel
      onRowSelectionModelChange={onRowSelected}
      onRowClick={onRowClick}
      disableColumnSorting
      disableColumnFilter
    />
  );
};

export default AuthorsTable;
