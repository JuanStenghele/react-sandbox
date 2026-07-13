import { useQuery } from "@tanstack/react-query";
import backend from "./backend";
import type { Book } from "../types/book";

export interface GetBooksRequest {
  search_term: string;
  page: number;
  page_size: number;
}

export interface GetBooksResponse {
  books: Book[];
  total_books: number;
  total_pages: number;
  current_page: number;
  page_size: number;
}

export const getBooks = async (params: GetBooksRequest): Promise<GetBooksResponse> => {
  const response = await backend.get<GetBooksResponse>("/v1/books", { params });
  return response.data;
};

export const useGetBooks = (params: GetBooksRequest) => {
  return useQuery({ queryKey: ["books", params], queryFn: () => getBooks(params) });
};
