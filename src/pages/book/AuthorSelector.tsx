import { Autocomplete, Box, CircularProgress, TextField, type AutocompleteRenderInputParams } from '@mui/material';
import type { Author } from '../../types/author';
import { forwardRef, useState } from 'react';
import type { HTMLAttributes, UIEvent } from 'react';
import { useGetAuthor, useGetInfiniteAuthors } from '../../services/authors';

interface AuthorSelectorProps {
  width?: number;
  value?: string;
  onChange?: (authorId: string) => void;
}

const getOptionLabel = (option: Author) => `${option.name} (${option.id})`;

const AuthorSelector = (props: AuthorSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useGetInfiniteAuthors({ 
    search_term: searchTerm, 
    page_size: 10 
  });

  const handleScroll = (event: UIEvent<HTMLUListElement>) => {
    const listboxNode = event.currentTarget;
    const isBottom = listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight - 20.0;
    if (isBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const authors = data?.pages.flatMap((page) => page.authors) ?? [];

  // Get author if the book already exists
  // Maybe the author has been already fetched...
  let selectedAuthor = authors.find((a) => a.id === props.value);
  // ...if not, fetch it
  const { data: selectedAuthorFetch } = useGetAuthor(
    props.value || undefined,
    !selectedAuthor && !!props.value
  );
  selectedAuthor = selectedAuthor ?? selectedAuthorFetch ?? undefined;

  const options = selectedAuthor ? [selectedAuthor, ...authors.filter((a) => a.id !== selectedAuthor.id)] : authors;

  return (
    <Autocomplete<Author>
      options={options}
      value={selectedAuthor}
      onChange={(_, author) => props.onChange?.(author?.id ?? '')}
      sx={{ width: props.width }}
      loading={isLoading}
      loadingText={(
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2.0 }}>
          <CircularProgress size={20.0} />
        </Box>
      )}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onInputChange={(_, value, reason) => {
        if (reason === 'input') {
          setSearchTerm(value);
        }
      }}
      renderOption={(props, option: Author) => (
        <Box component='li' {...props} key={option.id}>
          {getOptionLabel(option)}
        </Box>        
      )}
      slotProps={{
        listbox: {
          component: ListboxComponent,
          onScroll: handleScroll,
          ...({ loadingMore: isFetchingNextPage } as ListboxComponentProps)
        }
      }}
      renderInput={(params: AutocompleteRenderInputParams) => (
        <TextField
          {...params}
          label='Author'
        />
      )}
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
