import { useEffect, useState } from "react";
import { Grid, ActionPanel, Action } from "@raycast/api";
import fetch from "node-fetch";

interface Book {
  id: string;
  path: string;
  title: string;
  cover_image_small_url?: string;
}

interface ApiResponse {
  books: Book[];
}

export default function Command() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    (async function () {
      const res = await fetch("https://zenn.dev/api/books/");
      const data = await res.json();
      const response: ApiResponse = data as ApiResponse;
      setBooks(response.books);
    })();
  }, []);

  return (
    <Grid
      columns={5}
      fit={Grid.Fit.Fill}
      inset={Grid.Inset.Large}
      aspectRatio="3/4"
      filtering={false}
      navigationTitle="Search Books"
      searchBarPlaceholder="Search Books"
    >
      {books.map((item: Book) => (
        <Grid.Item
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={"https://zenn.dev" + item.path} />
            </ActionPanel>
          }
          title={item.title}
          key={item.id}
          content={item.cover_image_small_url ? item.cover_image_small_url : "https://zenn.dev/images/book.png"}
        />
      ))}
    </Grid>
  );
}
