import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MD2WeChat Pro — Markdown 公众号编辑器",
  description: "用 Markdown 写公众号文章，实时预览微信风格，一键推送草稿",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
