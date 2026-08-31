import { Box, Typography, TextField, InputAdornment } from "@mui/material";
import BooksTable from "./table/Table";
import { useAtom } from "jotai";
import { booksTableState, type BooksTableState } from "../../state/books";
import SearchIcon from "@mui/icons-material/Search";
import type { ChangeEvent } from "react";

const BooksPage = () => {
  const [tableState, setTableState] = useAtom(booksTableState);

  const onSearchTermChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTableState((prev: BooksTableState) => ({
      ...prev,
      searchTerm: event.target.value,
      page: 0
    }));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Typography variant="h4" gutterBottom>
        Books
      </Typography>
      <Box sx={{ mb: 2.0, display: "flex", gap: 1.0 }}>
        <TextField
          value={tableState.searchTerm}
          placeholder="Search..."
          variant="outlined"
          onChange={onSearchTermChange}
          sx={{
            width: 440.0,
            "& .MuiInputBase-root": {
              height: 48.0
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
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
