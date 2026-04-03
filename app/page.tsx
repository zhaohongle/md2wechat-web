'use client';

import { useState } from 'react';
import Editor from '@/components/Editor';
import Preview from '@/components/Preview';
import Toolbar from '@/components/Toolbar';
import ConfigModal from '@/components/ConfigModal';

export default function Home() {
  const [markdown, setMarkdown] = useState(`---
title: 我的第一篇微信文章
author: 作者
digest: 这是摘要，如果不填会自动生成
---

# 欢迎使用 md2wechat-pro

> 用 Markdown 写公众号文章，一键转换为精美排版。

## 功能特性

- ✅ 实时预览
- ✅ 3 种主题切换
- ✅ 一键创建草稿
- ✅ 图片自动上传

## 使用方法

1. 在左侧编辑 Markdown
2. 右侧实时预览效果
3. 选择主题
4. 点击"创建草稿"

---

**开始写作吧！** 🚀
`);

  const [theme, setTheme] = useState('default');
  const [showConfig, setShowConfig] = useState(false);

  return (
    <main className="h-screen flex flex-col">
      <Toolbar
        theme={theme}
        onThemeChange={setTheme}
        onConfigClick={() => setShowConfig(true)}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Editor value={markdown} onChange={setMarkdown} />
        <Preview markdown={markdown} theme={theme} />
      </div>

      {showConfig && (
        <ConfigModal onClose={() => setShowConfig(false)} />
      )}
    </main>
  );
}
