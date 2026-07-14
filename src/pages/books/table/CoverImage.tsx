import { Box } from '@mui/material';
import type { MouseEvent } from 'react';

interface BooksTableCoverImageProps {
  url: string;
  book_title: string;
};

const BooksTableCoverImage = (props: BooksTableCoverImageProps) => {
  const onClick = (event: MouseEvent, url: string) => {
    event.stopPropagation();
    window.open(url, '_blank');
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
      <img
        src={props.url}
        alt={`cover of ${props.book_title}`}
        style={{ height: 64.0, width: 72.0, objectFit: 'cover', padding: 6 }}
        onClick={(event) => onClick(event, props.url)}
      />
    </Box>
  )
};

export default BooksTableCoverImage;
