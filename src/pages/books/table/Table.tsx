import { useState } from 'react';
import {
  DataGrid,
  GridOverlay,
  type GridColDef,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import { useGetBooks } from '../../../services/books';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import ErrorIcon from '@mui/icons-material/Error';
import { Typography } from '@mui/material';
import BooksTableCoverImage from './CoverImage'

const BooksTable = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10
  });

  const { data, isLoading, isError } = useGetBooks({
    search_term: '',
    page: paginationModel.page + 1,
    page_size: paginationModel.pageSize,
  });

  const columns: GridColDef[] = [
    {
      field: 'cover_image_url',
      headerName: 'Cover',
      width: 72.0,
      renderCell: (params) =>
        params.value ? (
          <BooksTableCoverImage 
            url={params.value}
            book_title={params.row.title}
          />
        ) : null
    },
    { field: 'id', headerName: 'ID', width: 296.0 },
    { field: 'title', headerName: 'Title', width: 248.0 },
    { field: 'author_id', headerName: 'Author ID', width: 296.0 },
    { field: 'description', headerName: 'Description', width: 248.0 },
    { field: 'isbn', headerName: 'ISBN', width: 148.0 },
    { field: 'publication_date', headerName: 'Publication Date', type: 'date', width: 148.0 },
    { field: 'created_at', headerName: 'Created At', type: 'dateTime', width: 148.0 }
  ];

  const buildNoBooksFoundOverlay = () => {
    return (
      <GridOverlay>
        <WarningRoundedIcon sx={{ fontSize: 64 }}/>
        <Typography variant='h5'>
          No books found
        </Typography>
      </GridOverlay>
    );
  };

  const buildLoadingErrorOverlay = () => {
    return (
      <GridOverlay>
        <ErrorIcon sx={{ fontSize: 64 }}/>
        <Typography variant='h5'>
          Error loading books
        </Typography>
      </GridOverlay>
    );
  };

  return (
    <DataGrid
      rows={data?.books ?? []}
      rowHeight={64.0}
      columns={columns}
      loading={isLoading}
      rowCount={data?.total_books ?? 0}
      paginationMode='server'
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      pageSizeOptions={[10, 20, 50, 100]}
      slots={{
        noRowsOverlay: isError ? buildLoadingErrorOverlay : buildNoBooksFoundOverlay
      }}
      checkboxSelection
      disableColumnSorting
      disableColumnFilter
    />
  );
};

export default BooksTable;
