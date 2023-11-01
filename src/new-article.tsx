// https://github.com/zenn-dev/zenn-editor/blob/main/packages/zenn-cli/src/server/commands/new-article.ts

import { Form, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import fs from "fs-extra";
import crypto from "crypto";
import { handleOpenFile } from "./utilities";
import { getWorkingPath } from "./lib/helper";

const pickRandomEmoji = () => {
  // prettier-ignore
  const emojiList =["😺","📘","📚","📑","😊","😎","👻","🤖","😸","😽","💨","💬","💭","👋", "👌","👏","🙌","🙆","🐕","🐈","🦁","🐷","🦔","🐥","🐡","🐙","🍣","🕌","🌟","🔥","🌊","🎃","✨","🎉","⛳","🔖","📝","🗂","📌"]
  return emojiList[Math.floor(Math.random() * emojiList.length)];
};

export function generateFileIfNotExist(fullpath: string, content: string) {
  fs.outputFileSync(fullpath, content, { flag: "wx" });

  handleOpenFile(fullpath);
}

export function generateSlug(): string {
  return crypto.randomBytes(7).toString("hex");
}

export default function Command() {
  async function handleSubmit(values: {
    title: string;
    published: boolean;
    emoji: string;
    type: "idea" | "tech";
    publication: string;
    slug: string;
  }) {
    const slug = values.slug || generateSlug();
    const title = values.title || "";
    const emoji = values.emoji || pickRandomEmoji();
    const type = values.type === "idea" ? "idea" : "tech";
    const published = values.published === true ? "true" : "false";
    const publicationName = values.publication || "";

    const fileName = `${slug}.md`;

    const ARTICLES_PATH = getWorkingPath(`articles/${fileName}`);

    const fileBody =
      [
        "---",
        `title: "${title.replace(/"/g, '\\"')}"`,
        `emoji: "${emoji}"`,
        `type: "${type}" # tech: 技術記事 / idea: アイデア`,
        "topics: []",
        `published: ${published}`,
        publicationName !== "" ? `publication_name: ${publicationName.replace(/"/g, '\\"')}` : null,
        "---",
      ]
        .filter((v) => v)
        .join("\n") + "\n";

    try {
      generateFileIfNotExist(ARTICLES_PATH, fileBody);
    } catch (err) {
      await showToast({
        style: Toast.Style.Failure,
        title: "ファイルを作成できませんでした",
        message: "正しいパスを指定してください",
      });
      return;
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="title"
        title="記事タイトル"
        placeholder="「CSSで蛍光ペンっぽいアンダーライン」はtext-decorationで実現できる"
      />
      <Form.TextField id="slug" title="スラッグ" placeholder="3239ba0d49cda9" />
      <Form.TextField id="emoji" title="絵文字" placeholder="🚀" />
      <Form.Checkbox id="published" title="公開範囲" label="公開" storeValue />
      <Form.Dropdown id="type" title="タイプ">
        <Form.Dropdown.Item icon="https://zenn.dev/images/drawing/tech.svg" value="tech" title="Tech" />
        <Form.Dropdown.Item icon="https://zenn.dev/images/drawing/idea.svg" value="idea" title="Ideas" />
      </Form.Dropdown>
      <Form.TextField id="publication" title="Publication" placeholder="acme_inc" />
    </Form>
  );
}
