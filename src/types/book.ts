export interface Book {
  id: string;
  title: string;
  author_id: string;
  description: string | null;
  isbn: string | null;
  publication_date: Date | null;
  cover_image_url: string | null;
  created_at: Date;
}
