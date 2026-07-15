import { useQuery } from "@tanstack/react-query";
import backend from "./backend";
import type { Book } from "../types/book";

export interface GetBooksRequest {
  search_term: string;
  page: number;
  page_size: number;
}

export interface RawBook {
  id: string;
  title: string;
  author_id: string;
  description: string | null;
  isbn: string | null;
  publication_date: string | null;
  cover_image_url: string | null;
  created_at: string;
}

interface GetBooksBaseResponse {
  total_books: number;
  total_pages: number;
  current_page: number;
  page_size: number;
}

export interface GetBooksRawResponse extends GetBooksBaseResponse {
  books: RawBook[];
}

export interface GetBooksResponse extends GetBooksBaseResponse {
  books: Book[];
}

export const getBooks = async (params: GetBooksRequest): Promise<GetBooksResponse> => {
  const response = await backend.get<GetBooksRawResponse>("/v1/books", { params });
  const books = response.data.books.map((book) => ({
    ...book,
    publication_date: book.publication_date ? new Date(book.publication_date) : null,
    created_at: new Date(book.created_at),
  }));
  return { ...response.data, books };
};

export const useGetBooks = (params: GetBooksRequest) => {
  return useQuery({ queryKey: ["books", params], queryFn: () => getBooks(params) });
};
