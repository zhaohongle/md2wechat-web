'use client';

import { useEffect, useState } from 'react';

interface PreviewProps {
  markdown: string;
  theme: string;
}

export default function Preview({ markdown, theme }: PreviewProps) {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const convertMarkdown = async () => {
      if (!markdown.trim()) {
        setHtml('');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markdown, theme }),
        });

        const data = await response.json();
        if (data.success) {
          setHtml(data.data.html);
        } else {
          setHtml(`<p style="color: red;">转换失败: ${data.error?.message}</p>`);
        }
      } catch (error) {
        setHtml(`<p style="color: red;">转换失败: ${error}</p>`);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(convertMarkdown, 300); // 防抖
    return () => clearTimeout(timer);
  }, [markdown, theme]);

  return (
    <div className="w-1/2 bg-gray-50 overflow-auto p-8">
      {loading && (
        <div className="text-center text-gray-500">转换中...</div>
      )}
      <div
        className="max-w-3xl mx-auto bg-white shadow-lg p-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
