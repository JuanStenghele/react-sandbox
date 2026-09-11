import {
  DataGrid,
  GridOverlay,
  type GridColDef,
  type GridPaginationModel,
  type GridRowParams,
  type GridRowSelectionModel,
} from '@mui/x-data-grid';
import { useGetBooks } from '../../../services/books';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import ErrorIcon from '@mui/icons-material/Error';
import { Typography } from '@mui/material';
import BooksTableCoverImage from './CoverImage'
import { useAtom } from 'jotai';
import { booksTableState, type BooksTableState } from '../../../state/books';
import { useDebounce } from 'use-debounce';
import { ROUTES } from '../../../constants';
import { generatePath, useNavigate } from 'react-router';

const BooksTable = () => {
  const navigate = useNavigate();
  const [tableState, setTableState] = useAtom(booksTableState);
  const [debouncedSearchTerm] = useDebounce(tableState.searchTerm, 300);

  const { data, isFetching, isError } = useGetBooks({
    search_term: debouncedSearchTerm,
    page: tableState.page + 1,
    page_size: tableState.pageSize,
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

  const onRowClick = (params: GridRowParams) => {
    navigate(generatePath(ROUTES.editBook, { id: params.row.id }), { state: { book: params.row } });
  };

  const onRowSelected = (newSelectionModel: GridRowSelectionModel) => {
    setTableState((prev: BooksTableState) => ({
      ...prev,
      selectedRowsIds: new Set([...newSelectionModel.ids].map((id) => id.toString()))
    }));
  };
  
  const onPaginationChange = (model: GridPaginationModel) => {
    setTableState((prev: BooksTableState) => ({
      ...prev,
      page: model.page,
      pageSize: model.pageSize
    }));
  };

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
      loading={isFetching}
      rowCount={data?.total_books ?? 0}
      paginationMode='server'
      paginationModel={{
        page: tableState.page,
        pageSize: tableState.pageSize
      }}
      onPaginationModelChange={onPaginationChange}
      pageSizeOptions={[10, 20, 50, 100]}
      slots={{
        noRowsOverlay: isError ? buildLoadingErrorOverlay : buildNoBooksFoundOverlay
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
      disableColumnSorting
      disableColumnFilter
      onRowClick={onRowClick}
    />
  );
};

export default BooksTable;
