import { Box } from "@mui/material";
import type { MouseEvent } from "react";

interface BooksTableCoverImageProps {
  url: string;
  book_title: string;
}

const BooksTableCoverImage = (props: BooksTableCoverImageProps) => {
  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();
    window.open(props.url, "_blank");
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (event.button === 1) {
      event.preventDefault();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <img
        src={props.url}
        alt={`cover of ${props.book_title}`}
        draggable={false}
        style={{
          height: 64,
          width: 72,
          objectFit: "cover",
          padding: 6,
          cursor: "pointer",
        }}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onAuxClick={handleClick}
      />
    </Box>
  );
};

export default BooksTableCoverImage;
