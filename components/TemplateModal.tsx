'use client';

import { FileText, X } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
}

interface TemplateModalProps {
  onClose: () => void;
  onSelect: (content: string) => void;
}

const templates: Template[] = [
  {
    id: 'tech-article',
    name: '技术文章',
    description: '适合技术教程、开发经验分享',
    content: `---
title: 技术文章标题
author: 作者名
digest: 文章摘要，简要介绍文章内容
---

# 技术文章标题

> 一句话概括文章主题

## 背景

说明为什么要写这篇文章，要解决什么问题。

## 问题分析

详细分析问题的原因和影响。

## 解决方案

### 方案一

\`\`\`javascript
// 代码示例
function example() {
  console.log('Hello World');
}
\`\`\`

### 方案二

...

## 最佳实践

总结最佳实践和注意事项。

## 总结

总结文章要点。

---

**参考资料：**
- [链接1](https://example.com)
- [链接2](https://example.com)
`,
  },
  {
    id: 'product-intro',
    name: '产品介绍',
    description: '适合产品发布、功能介绍',
    content: `---
title: 产品名称 - 一句话卖点
author: 产品团队
digest: 产品简介，核心价值主张
---

# 产品名称

> 一句话介绍产品

## 核心功能

### 功能 1
![功能截图](https://example.com/image1.jpg)

功能描述...

### 功能 2
![功能截图](https://example.com/image2.jpg)

功能描述...

## 适用场景

- 场景 1：...
- 场景 2：...
- 场景 3：...

## 如何开始

1. 第一步
2. 第二步
3. 第三步

## 定价方案

| 方案 | 价格 | 功能 |
|------|------|------|
| 免费版 | ¥0 | 基础功能 |
| 专业版 | ¥99/月 | 全部功能 |

## 联系我们

- 官网：https://example.com
- 邮箱：contact@example.com
`,
  },
  {
    id: 'tutorial',
    name: '教程指南',
    description: '适合操作指南、使用教程',
    content: `---
title: 如何使用 XXX？完整指南
author: 作者名
digest: 手把手教你使用 XXX，从入门到精通
---

# 如何使用 XXX？

> 本文将手把手教你使用 XXX

## 前提条件

在开始之前，请确保：

- [ ] 已安装 XXX
- [ ] 已注册账号
- [ ] 已配置环境

## Step 1：初始化

\`\`\`bash
# 命令示例
npm install xxx
\`\`\`

说明...

## Step 2：配置

...

## Step 3：使用

...

## 常见问题

**Q1：遇到错误 XXX 怎么办？**

A：...

**Q2：如何 XXX？**

A：...

## 总结

恭喜你完成了本教程！

---

**延伸阅读：**
- [进阶教程](https://example.com)
`,
  },
  {
    id: 'weekly',
    name: '周报/总结',
    description: '适合工作周报、项目总结',
    content: `---
title: YYYY年第W周工作周报
author: 姓名
digest: 本周工作总结与下周计划
---

# 第 W 周工作周报

> YYYY-MM-DD ~ YYYY-MM-DD

## 本周完成

### 项目 A
- ✅ 完成功能 X 开发
- ✅ 完成测试用例编写
- ✅ 上线生产环境

### 项目 B
- ✅ 完成需求评审
- ✅ 完成技术方案设计

## 本周数据

| 指标 | 数值 | 环比 |
|------|------|------|
| 指标1 | 100 | +10% |
| 指标2 | 200 | +5% |

## 遇到的问题

1. **问题 1：** 描述 + 解决方案
2. **问题 2：** 描述 + 解决方案

## 下周计划

- [ ] 任务 1
- [ ] 任务 2
- [ ] 任务 3

## 其他

...
`,
  },
];

export default function TemplateModal({ onClose, onSelect }: TemplateModalProps) {
  const handleSelect = (template: Template) => {
    onSelect(template.content);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">选择模板</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {template.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
