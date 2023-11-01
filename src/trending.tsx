import { useEffect, useState } from "react";
import { List } from "@raycast/api";
import fetch from "node-fetch";
import dayjs from "dayjs";
import Article from "./components/Article";
import { ArticleType } from "./types";

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export default function ZennArticles() {
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [loading, isLoading] = useState(true);
  const [articleType, setArticleType] = useState<string | null>(null);

  useEffect(() => {
    (async function () {
      const res = await fetch("https://zenn.dev/api/articles");
      const data = (await res.json()) as Record<string, any>;
      setArticles(data.articles as ArticleType[]);
      isLoading(false);
    })();
  }, []);

  function handleDropdownChange(selectedType: string | undefined) {
    if (selectedType && selectedType !== "all") {
      setArticleType(selectedType);
    } else {
      setArticleType(null);
    }
  }

  const filteredArticles = articleType ? articles.filter((article) => article.article_type === articleType) : articles;

  return (
    <List
      isLoading={loading}
      filtering={true}
      navigationTitle="Zenn Articles"
      searchBarPlaceholder="Search Trending"
      searchBarAccessory={
        <List.Dropdown tooltip="Dropdown With Sections" onChange={handleDropdownChange}>
          <List.Dropdown.Item title="ALL" icon="🗃" value="all" />
          <List.Dropdown.Item title="Tech" icon="https://zenn.dev/images/drawing/tech.svg" value="tech" />
          <List.Dropdown.Item title="Ideas" icon="https://zenn.dev/images/drawing/idea.svg" value="idea" />
        </List.Dropdown>
      }
    >
      {filteredArticles.map((article) => (
        <Article key={article.slug} article={article} />
      ))}
    </List>
  );
}
