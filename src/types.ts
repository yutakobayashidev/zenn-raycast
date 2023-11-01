export type ArticleType = {
  slug: string;
  title: string;
  liked_count: number;
  path: string;
  published_at: string;
  article_type: string;
  emoji: string;
  username: string;
  user: {
    name: string;
    username: string;
  };
};
