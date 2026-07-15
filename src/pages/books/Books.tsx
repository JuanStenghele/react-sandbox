import { Box, Typography } from "@mui/material";
import BooksTable from "./table/Table";

const BooksPage = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Typography variant="h4" gutterBottom>
        Books
      </Typography>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <BooksTable />
      </Box>
    </Box>
  );
}

export default BooksPage
