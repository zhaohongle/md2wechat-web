'use client';

import { useState } from 'react';
import { Settings, Send, Upload, Image, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ToolbarProps {
  markdown: string;
  theme: string;
  onThemeChange: (theme: string) => void;
  onConfigClick: () => void;
  onMarkdownChange: (markdown: string) => void;
  onTemplateClick: () => void;
}

export default function Toolbar({ markdown, theme, onThemeChange, onConfigClick, onMarkdownChange, onTemplateClick }: ToolbarProps) {
  const [loading, setLoading] = useState(false);
  const [processingImages, setProcessingImages] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const themes = [
    { id: 'default', name: '默认' },
    { id: 'bytedance', name: '字节' },
    { id: 'chinese', name: '中文' },
  ];

  // 上传封面图
  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('仅支持 JPG / PNG / GIF 格式');
      return;
    }

    // 验证文件大小
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`文件过大: ${(file.size / 1024 / 1024).toFixed(2)} MB（最大 2 MB）`);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      toast.loading('上传封面图...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setCoverImage(data.data.path);
        toast.success('封面图上传成功');
      } else {
        toast.error(data.error?.message || '上传失败');
      }
    } catch (error) {
      toast.error('上传失败，请重试');
    }
  };

  // 导出 HTML
  const handleExportHtml = async () => {
    const toastId = toast.loading('正在导出 HTML...');

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown, theme }),
      });

      const data = await response.json();

      if (data.success) {
        const html = data.data.html;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `article-${Date.now()}.html`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('HTML 导出成功', { id: toastId });
      } else {
        toast.error(data.error?.message || '导出失败', { id: toastId });
      }
    } catch (error) {
      toast.error('导出失败，请重试', { id: toastId });
    }
  };

  // 处理图片
  const handleProcessImages = async () => {
    const appid = localStorage.getItem('wechat_appid');
    const secret = localStorage.getItem('wechat_secret');

    if (!appid || !secret) {
      toast.error('请先配置微信公众号 AppID 和 AppSecret');
      onConfigClick();
      return;
    }

    setProcessingImages(true);
    const toastId = toast.loading('正在处理图片...');

    try {
      const response = await fetch('/api/process-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown, appid, secret }),
      });

      const data = await response.json();

      if (data.success) {
        onMarkdownChange(data.data.markdown);
        toast.success(data.data.message, { id: toastId });
      } else {
        toast.error(data.error?.message || '图片处理失败', { id: toastId });
      }
    } catch (error) {
      toast.error('图片处理失败，请重试', { id: toastId });
    } finally {
      setProcessingImages(false);
    }
  };

  // 创建草稿
  const handleCreateDraft = async () => {
    if (!markdown.trim()) {
      toast.error('Markdown 内容不能为空');
      return;
    }

    // 从 localStorage 获取配置
    const appid = localStorage.getItem('wechat_appid');
    const secret = localStorage.getItem('wechat_secret');

    if (!appid || !secret) {
      toast.error('请先配置微信公众号 AppID 和 AppSecret');
      onConfigClick();
      return;
    }

    setLoading(true);
    const toastId = toast.loading('正在创建草稿...');

    try {
      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown,
          theme,
          appid,
          secret,
          coverImagePath: coverImage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`草稿创建成功！\n标题: ${data.data.title}\nmedia_id: ${data.data.media_id}`, {
          id: toastId,
          duration: 5000,
        });
      } else {
        const errorMsg = data.error?.hint 
          ? `${data.error.message}\n提示: ${data.error.hint}`
          : data.error?.message || '创建失败';
        toast.error(errorMsg, { id: toastId });
      }
    } catch (error) {
      toast.error('创建失败，请检查网络连接', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">md2wechat-pro</h1>
        <span className="text-sm text-gray-500">在线编辑器</span>
      </div>

      <div className="flex items-center gap-4">
        {/* 模板按钮 */}
        <button
          onClick={onTemplateClick}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          title="选择模板"
        >
          <FileText className="w-5 h-5 text-gray-600" />
        </button>

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

        {/* 导出 HTML */}
        <button
          onClick={handleExportHtml}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          title="导出 HTML"
        >
          <Download className="w-5 h-5 text-gray-600" />
        </button>

        {/* 处理图片 */}
        <button
          onClick={handleProcessImages}
          disabled={processingImages}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="上传图片到微信"
        >
          <Image className="w-5 h-5 text-gray-600" />
        </button>

        {/* 上传封面图 */}
        <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-md transition-colors" title="上传封面图">
          <Upload className="w-5 h-5 text-gray-600" />
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleUploadCover}
            className="hidden"
          />
        </label>
        {coverImage && (
          <span className="text-xs text-green-600">✓ 封面已上传</span>
        )}

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
          onClick={handleCreateDraft}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title="创建草稿"
        >
          <Send className="w-4 h-4" />
          {loading ? '创建中...' : '创建草稿'}
        </button>
      </div>
    </div>
  );
}
