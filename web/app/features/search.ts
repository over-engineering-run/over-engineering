import type { LoaderFunction } from "@remix-run/server-runtime";
import { db } from "~/utils/db.server";

interface Result {
  href: string;
  title: string;
  series: string;
  hashtags: string[];
  snippet: string;
  publish_at: string;
}

export interface SearchResult {
  results: Result[];
  count: number;
}

export const get: LoaderFunction = async () => {
  const data = await db.article.findMany({
    select: {
      href: true,
      title: true,
    },
  });

  return {
    results: [
      {
        href: "https://ithelp.ithome.com.tw/articles/10259604",
        title: `[Day2] 抓取每日收盤價`,
        series: "從零開始使用python打造簡易投資工具",
        snippet:
          "本日目標為抓取0050的收盤價，以下分為抓取1分K資料的部分和轉換成每日收盤價的部分",
        hashtags: ["永豐金融APIs"],
        publish_at: "2021-09-02 21:27:38",
      },
    ],
    count: 1,
  };
};
