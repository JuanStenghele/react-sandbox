import { Autocomplete, Box, CircularProgress, TextField, type AutocompleteRenderInputParams } from '@mui/material';
import type { Author } from '../../types/author';
import { forwardRef, useState } from 'react';
import type { HTMLAttributes, UIEvent } from 'react';
import { useGetInfiniteAuthors } from '../../services/authors';

interface AuthorSelectorProps {
  width?: number;
}

const AuthorSelector = (props: AuthorSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useGetInfiniteAuthors({ search_term: searchTerm });

  const initialLoadingComponent = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2.0 }}>
      <CircularProgress size={20.0} />
    </Box>
  );

  const optionComponent = (props: HTMLAttributes<HTMLLIElement> & { key: React.Key }, option: Author) => (
    <Box component='li' {...props} key={option.id}>
      {`${option.name} (${option.id})`}
    </Box>
  );

  const inputComponent = (params: AutocompleteRenderInputParams) => (
    <TextField
      {...params}
      label='Author'
    />
  );

  const handleScroll = (event: UIEvent<HTMLUListElement>) => {
    const listboxNode = event.currentTarget;
    const isBottom = listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight - 20.0;
    if (isBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const authors = data?.pages.flatMap((page) => page.authors) ?? [];

  return (
    <Autocomplete<Author>
      options={authors}
      sx={{ width: props.width }}
      loading={isLoading}
      loadingText={initialLoadingComponent()}
      getOptionLabel={(option) => `${option.name} (${option.id})`}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onInputChange={(_, value) => {
        setSearchTerm(value);
      }}
      renderOption={optionComponent}
      slotProps={{
        listbox: {
          component: ListboxComponent,
          onScroll: handleScroll,
          ...({ loadingMore: isFetchingNextPage } as ListboxComponentProps)
        }
      }}
      renderInput={inputComponent}
    />
  );
};

interface ListboxComponentProps extends HTMLAttributes<HTMLUListElement> {
  loadingMore?: boolean;
}

const ListboxComponent = forwardRef<HTMLUListElement, ListboxComponentProps>(
  ({ children, loadingMore, ...other }, ref) => (
    <ul ref={ref} {...other}>
      {children}
      {loadingMore && (
        <Box component='li' sx={{ display: 'flex', justifyContent: 'center', py: 2.0 }}>
          <CircularProgress size={20.0} />
        </Box>
      )}
    </ul>
  ),
);

export default AuthorSelector;
