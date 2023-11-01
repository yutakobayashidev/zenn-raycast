// https://github.com/zenn-dev/zenn-editor/blob/canary/packages/zenn-cli/src/server/lib/books.ts

import path from "path";
import { getWorkingPath, listFilenames, getFileRaw, acceptImageExtensions } from "./helper";
import yaml from "js-yaml";
import { listDirnames } from "./helper";
import matter from "gray-matter";

function getBookFullDirpath(slug: string) {
  return getWorkingPath(`books/${slug}`);
}

export function getChapterFilenames(bookSlug: string): string[] {
  const dirpath = getWorkingPath(`books/${bookSlug}`);
  const allFiles = listFilenames(dirpath);

  if (allFiles === null) return [];
  return allFiles.filter((f) => /\.md$/.test(f));
}

function getBookConfigRaw(slug: string) {
  const fullDirpath = getBookFullDirpath(slug);
  const fullpath = path.join(fullDirpath, "config.yaml");
  const fallbackFullpath = path.join(fullDirpath, "config.yml");

  const fileRaw = getFileRaw(fullpath) || getFileRaw(fallbackFullpath);
  return fileRaw;
}

export function getLocalBookMeta(slug: string) {
  const bookMeta = readBookFile(slug);
  if (!bookMeta) return null;

  return bookMeta;
}

function getChapterPositionAndSlug(
  book: Book,
  filename: string
): {
  slug: string;
  position: null | number;
} {
  const filenameWithoutExt = filename.replace(/\.md$/, "");
  // get chapter number according to book.specifiedChapterSlugs (originally specified on config.yaml)
  if (book.specifiedChapterSlugs?.length) {
    const slug = filenameWithoutExt;
    const chapterIndex = book.specifiedChapterSlugs.findIndex((s) => s === slug);
    return {
      slug,
      position: chapterIndex >= 0 ? chapterIndex : null,
    };
  }
  // get chapter number by filename
  const split = filenameWithoutExt.split(".");
  // filename must be `n.slug.md`
  if (split.length === 2) {
    const position = Number(split[0]);
    const slug = split[1];
    return {
      position,
      slug,
    };
  } else {
    // invalid filename
    return {
      position: null,
      slug: filenameWithoutExt,
    };
  }
}

function getBookSlugs(): string[] {
  const dirFullpath = getWorkingPath("books");
  const allDirs = listDirnames(dirFullpath);

  if (allDirs === null) return [];

  return allDirs.filter((filename) => !/^\./.test(filename));
}

export function getLocalBookMetaList() {
  const slugs = getBookSlugs();
  const books = slugs.map((slug) => getLocalBookMeta(slug));
  return books;
}

function getChapterFileRaw(bookSlug: string, chapterFilename: string) {
  const fullpath = getWorkingPath(`books/${bookSlug}/${chapterFilename}`);
  const fileRaw = getFileRaw(fullpath);
  if (!fileRaw) {
    throw `${fullpath}の内容を取得できませんでした`;
  }
  return fileRaw;
}

function readChapterFile(book: Book, filename: string) {
  const { position, slug } = getChapterPositionAndSlug(book, filename);
  const raw = getChapterFileRaw(book.slug, filename);
  if (!raw) return null;
  const { data, content: bodyMarkdown } = matter(raw);
  return {
    meta: {
      ...data,
      position,
      slug,
      filename,
    },
    book,
    bodyMarkdown,
  };
}

export type Book = {
  slug: string;
  title?: string;
  summary?: string;
  price?: number;
  topics?: string[];
  tags?: string[];
  published?: boolean;
  specifiedChapterSlugs?: string[];
  chapterOrderedByConfig: boolean;
  coverDataUrl?: string;
  coverFilesize?: number;
  coverPath?: string;
  coverWidth?: number;
  coverHeight?: number;
};

export type Chapter = {
  slug: string;
  filename: string;
  title?: string;
  free?: boolean;
  position: null | number;
};

export type ChapterMeta = Chapter & {
  bodyMarkdown?: string;
  book: Book;
};

function getLocalChapterMeta(book: Book, chapterFilename: string): null | ChapterMeta {
  const data = readChapterFile(book, chapterFilename);
  if (!data) return null;

  return {
    book,
    ...data.meta,
    bodyMarkdown: data.bodyMarkdown,
  };
}

export function getLocalChapterMetaList(book: Book) {
  const filenames = getChapterFilenames(book.slug);

  const chapters = filenames
    .map((chapterFilename) => getLocalChapterMeta(book, chapterFilename))
    .filter((chapter): chapter is ChapterMeta => chapter !== null)
    .sort((a, b) => {
      return Number(a.position === null ? 999 : a.position) - Number(b.position === null ? 999 : b.position);
    });

  return chapters;
}

export function readBookFile(slug: string) {
  const configRaw = getBookConfigRaw(slug);
  if (!configRaw) return null;

  try {
    const yamlData = yaml.load(configRaw) as any;
    if (typeof yamlData === "string" || typeof yamlData === "number") {
      throw "Invalid yaml format.";
    }
    if (!yamlData) return null;

    const filenames = listFilenames(getBookFullDirpath(slug));

    const targetCoverFilename = filenames?.find((filename) =>
      acceptImageExtensions.map((ext) => `cover${ext}`).includes(filename)
    );

    if (!targetCoverFilename)
      return {
        slug,
        ...yamlData,
        specifiedChapterSlugs: (yamlData as any).chapters,
        chapterOrderedByConfig: !!(yamlData as any).chapters?.length,
      };

    return {
      slug,
      ...yamlData,
      coverPath: getWorkingPath(`books/${slug}/${targetCoverFilename}`),
      specifiedChapterSlugs: (yamlData as any).chapters,
      chapterOrderedByConfig: !!(yamlData as any).chapters?.length,
    };
  } catch (e) {
    // couldn't load yaml files
    console.log(e);
    return null;
  }
}
