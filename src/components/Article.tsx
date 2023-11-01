import { FC } from "react";
import { List, Icon, ActionPanel, Action } from "@raycast/api";
import dayjs from "dayjs";
import { ArticleType } from "../types";

interface ArticleProps {
  article: ArticleType;
}

const Article: FC<ArticleProps> = ({ article }) => {
  return (
    <List.Item
      key={article.slug}
      subtitle={article.user.name}
      icon={article.emoji}
      title={article.title}
      accessories={[
        { icon: Icon.Heart, text: `${article.liked_count}` },
        { icon: Icon.Clock, text: dayjs(article.published_at).fromNow() },
      ]}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={"https://zenn.dev" + article.path} />
          <Action.OpenInBrowser title="Open User" url={"https://zenn.dev/" + article.user.username} />
        </ActionPanel>
      }
    />
  );
};

export default Article;
