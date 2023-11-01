import { useEffect, useState } from "react";
import { Grid, ActionPanel, Action, List, Icon, getPreferenceValues, Image } from "@raycast/api";
import { handleOpenFile } from "./utilities";
import { getWorkingPath } from "./lib/helper";
import { getLocalChapterMetaList, getLocalBookMetaList, Book, ChapterMeta } from "./lib/books";

const { zennFolder } = getPreferenceValues();

function getIcon(index: number): Image.ImageLike {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <rect x="0" y="0" width="40" height="40" fill="#3EA8FF" rx="10"></rect>
    <text
    font-size="22"
    fill="white"
    font-family="Verdana"
    text-anchor="middle"
    alignment-baseline="baseline"
    x="20.5"
    y="32.5">${index}</text>
  </svg>
    `.replaceAll("\n", "");

  return {
    source: `data:image/svg+xml,${svg}`,
  };
}

function BooksDetail(props: { book: Book }) {
  const [chapters, setChapters] = useState<ChapterMeta[]>([]);
  useEffect(() => {
    try {
      const chapters = getLocalChapterMetaList(props.book);
      setChapters(chapters);
    } catch (error) {
      console.error("Error reading books folder:", error);
    }
  }, []);

  return (
    <>
      <List isShowingDetail searchBarPlaceholder="Search Chapters">
        {chapters.map((chapter, i) => {
          return (
            <List.Item
              key={i}
              actions={
                <ActionPanel>
                  <Action
                    title={`Edit ${chapter.filename}`}
                    icon={Icon.Pencil}
                    onAction={() => handleOpenFile(getWorkingPath(`books/${chapter.book.slug}/${chapter.filename}`))}
                  />
                </ActionPanel>
              }
              icon={getIcon(i + 1)}
              title={chapter.filename}
              detail={<List.Item.Detail markdown={"# " + chapter.title + chapter.bodyMarkdown} />}
            />
          );
        })}
      </List>
    </>
  );
}

export default function Command() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const books = getLocalBookMetaList();

    try {
      setBooks(books);
    } catch (error) {
      console.error("Error reading books folder:", error);
    }
  }, [zennFolder]);

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
      {books.map((item) => (
        <Grid.Item
          actions={
            <ActionPanel>
              <Action.Push title="Show Books" icon={Icon.Book} target={<BooksDetail book={item} />} />
              <Action
                title={`Open /books/${item.slug} Folder`}
                icon={Icon.Folder}
                onAction={() => handleOpenFile(getWorkingPath(`/books/${item.slug}`))}
              />
            </ActionPanel>
          }
          title={item.title}
          key={item.slug}
          content={item.coverPath ?? "https://static.zenn.studio/images/book.png"}
        />
      ))}
    </Grid>
  );
}
