import { useState } from 'react';
import {
  DataGrid,
  GridOverlay,
  type GridColDef,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import { useGetAuthors } from '../../../services/authors';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import ErrorIcon from '@mui/icons-material/Error';
import { Typography } from '@mui/material';

const AuthorsTable = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10
  });

  const { data, isLoading, isError } = useGetAuthors({
    search_term: '',
    page: paginationModel.page + 1,
    page_size: paginationModel.pageSize,
  });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 296.0 },
    { field: 'name', headerName: 'Name', width: 248.0 }
  ];

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
      loading={isLoading}
      rowCount={data?.total_authors ?? 0}
      paginationMode='server'
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      pageSizeOptions={[10, 20, 50, 100]}
      slots={{
        noRowsOverlay: isError ? buildLoadingErrorOverlay : buildNoAuthorsFoundOverlay
      }}
      checkboxSelection
      disableColumnSorting
      disableColumnFilter
    />
  );
};

export default AuthorsTable;
