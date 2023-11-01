import { Action, ActionPanel, List, Icon, Color } from "@raycast/api";
import { useState, useEffect } from "react";
import fetch from "node-fetch";
import dayjs from "dayjs";
import { ArticleType } from "./types";
import Article from "./components/Article";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface ScrapData {
  slug: string;
  user: {
    avatar_small_url: string;
    username: string;
  };
  title: string;
  closed: boolean;
  comments_count: number;
  path: string;
}

export default function ZennArticles() {
  const [searchText, setSearchText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<null | ArticleType[]>(null);
  const [scraps, setScraps] = useState<null | ScrapData[]>(null);
  useEffect(() => {
    const searchNotionPages = async () => {
      setIsLoading(true);

      const url = `https://zenn.dev/api/search?q=${searchText}&order=daily&source=articles&page=1`;

      const searchedPages = await fetch(url);
      const page = await searchedPages.json();

      setArticles(page.articles);

      const scraps = `https://zenn.dev/api/search?q=${searchText}&order=daily&source=scraps&page=1`;

      const scrapsdata = await fetch(scraps);

      const scrapdata = await scrapsdata.json();

      setScraps(scrapdata.scraps);
      setIsLoading(false);
    };
    searchNotionPages();
  }, [searchText]);

  console.log(articles);

  return (
    <List
      filtering={true}
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      navigationTitle="Zenn Articles"
      searchBarPlaceholder="Search zenn.dev"
    >
      <List.Section title="Articles">
        {articles && articles.map((article) => <Article key={article.slug} article={article} />)}
      </List.Section>
      <List.Section title="Scraps">
        {scraps &&
          scraps.map((scrap) => (
            <List.Item
              key={scrap.slug}
              icon={scrap.user.avatar_small_url}
              title={scrap.title}
              subtitle={scrap.user.username}
              accessories={[
                { icon: Icon.Bubble, text: `${scrap.comments_count}` },
                {
                  tag: {
                    value: scrap.closed ? "Closed" : "Open",
                    color: scrap.closed ? Color.Purple : Color.Blue,
                  },
                },
              ]}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser url={"https://zenn.dev" + scrap.path} />
                  <Action.OpenInBrowser title="Open User" url={"https://zenn.dev/" + scrap.user.username} />
                </ActionPanel>
              }
            />
          ))}
      </List.Section>
    </List>
  );
}
