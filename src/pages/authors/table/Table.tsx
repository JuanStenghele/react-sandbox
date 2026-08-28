import { useState } from 'react';
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
import { useSetAtom } from 'jotai';
import { selectedAuthorRowsIds } from '../../../state/authors';
import { generatePath, useNavigate } from 'react-router';
import { ROUTES } from '../../../constants';

const AuthorsTable = () => {
  const navigate = useNavigate();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10
  });

  const { data, isFetching, isError } = useGetAuthors({
    search_term: '',
    page: paginationModel.page + 1,
    page_size: paginationModel.pageSize,
  });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 296.0 },
    { field: 'name', headerName: 'Name', width: 248.0 }
  ];

  const setSelectedRowsIds = useSetAtom(selectedAuthorRowsIds);

  const onRowClick = (params: GridRowParams) => {
    navigate(generatePath(ROUTES.editAuthor, { id: params.row.id }), { state: { author: params.row } });
  };

  const onRowSelected = (newSelectionModel: GridRowSelectionModel) => {
    setSelectedRowsIds(new Set([...newSelectionModel.ids].map((id) => id.toString())));
  };

  const buildNoAuthorsFoundOverlay = () => {
    return (
      <GridOverlay>
        <WarningRoundedIcon sx={{ fontSize: 64 }}/>
        <Typography variant='h5'>
          No authors found
        </Typography>
      </GridOverlay>
    );
  };

  const buildLoadingErrorOverlay = () => {
    return (
      <GridOverlay>
        <ErrorIcon sx={{ fontSize: 64 }}/>
        <Typography variant='h5'>
          Error loading authors
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
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      pageSizeOptions={[10, 20, 50, 100]}
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
