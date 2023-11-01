import { useEffect, useState } from "react";
import { Action, ActionPanel, Icon, List, getPreferenceValues, Detail } from "@raycast/api";
import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { handleOpenFile } from "./utilities";

interface Article {
  fileName: string;
  title: string;
  emoji: string;
  topics: string[];
  filePath: string;
  type: string;
}

const { zennFolder } = getPreferenceValues();
const ARTICLES_PATH = path.join(zennFolder, "articles");

function ArticleDetail(props: { id: string }) {
  const [article, setArticle] = useState({});

  useEffect(() => {
    const filePath = path.join(ARTICLES_PATH, props.id);

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data: metadata, content: markdown } = matter(fileContent);

    const aa = {
      metadata,
      filePath,
      markdown,
      file: props.id,
    };

    setArticle(aa);
  }, []);

  return (
    <Detail
      actions={
        <ActionPanel>
          <Action title={`Edit ${article.file}`} icon={Icon.Pencil} onAction={() => handleOpenFile(article.filePath)} />
        </ActionPanel>
      }
      markdown={"# " + article.markdown}
    />
  );
}

export default function ZennArticles() {
  const [searchText, setSearchText] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [articleType, setArticleType] = useState<string | null>(null);

  useEffect(() => {
    const articleFiles = fs.readdirSync(ARTICLES_PATH).filter((file) => path.extname(file).toLowerCase() === ".md");

    const articleData = articleFiles.map((file) => {
      const filePath = path.join(ARTICLES_PATH, file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { data: { title = file, emoji = "📝", topics = [], type = "none" } = {} } = matter(fileContent);
      return { fileName: file, filePath, title, emoji, topics, type };
    });

    setArticles(articleData);
  }, [zennFolder]);

  function handleDropdownChange(selectedType: string | undefined) {
    if (selectedType && selectedType !== "all") {
      setArticleType(selectedType);
    } else {
      setArticleType(null);
    }
  }

  const filteredArticles = articleType ? articles.filter((article) => article.type === articleType) : articles;

  return (
    <List
      filtering={true}
      onSearchTextChange={setSearchText}
      navigationTitle="Zenn Articles"
      searchBarPlaceholder="Search Articles"
      searchBarAccessory={
        <List.Dropdown tooltip="Dropdown With Sections" onChange={handleDropdownChange}>
          <List.Dropdown.Item title="ALL" icon="🗃" value="all" />
          <List.Dropdown.Item title="Tech" icon="https://zenn.dev/images/drawing/tech.svg" value="tech" />
          <List.Dropdown.Item title="Ideas" icon="https://zenn.dev/images/drawing/idea.svg" value="idea" />
        </List.Dropdown>
      }
    >
      {filteredArticles.map((article) => (
        <List.Item
          key={article.fileName}
          icon={article.emoji}
          title={article.title}
          subtitle={article.topics.join(", ")}
          actions={
            <ActionPanel>
              <Action.Push
                title="Show Articles"
                icon={Icon.BlankDocument}
                target={<ArticleDetail id={article.fileName} />}
              />
              <Action
                title={`Edit ${article.fileName}`}
                icon={Icon.Pencil}
                onAction={() => handleOpenFile(article.filePath)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
