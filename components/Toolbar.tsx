'use client';

import { Settings, Send } from 'lucide-react';

interface ToolbarProps {
  theme: string;
  onThemeChange: (theme: string) => void;
  onConfigClick: () => void;
}

export default function Toolbar({ theme, onThemeChange, onConfigClick }: ToolbarProps) {
  const themes = [
    { id: 'default', name: '默认' },
    { id: 'bytedance', name: '字节' },
    { id: 'chinese', name: '中文' },
  ];

  return (
    <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">md2wechat-pro</h1>
        <span className="text-sm text-gray-500">在线编辑器</span>
      </div>

      <div className="flex items-center gap-4">
        {/* 主题选择 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">主题:</span>
          <select
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {themes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* 配置按钮 */}
        <button
          onClick={onConfigClick}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          title="配置"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>

        {/* 创建草稿按钮 */}
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          title="创建草稿"
        >
          <Send className="w-4 h-4" />
          创建草稿
        </button>
      </div>
    </div>
  );
}
