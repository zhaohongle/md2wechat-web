'use client';
import { useRef, useState } from 'react';

interface Props {
  html: string;
  isConverting: boolean;
  sessionTitle: string;
  onRefresh: () => void;
  onToast: (msg: string, type: 'success'|'error'|'info') => void;
}

export default function PreviewPanel({ html, isConverting, sessionTitle, onRefresh, onToast }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const placeholder = `<p style="color:#999;text-align:center;padding:40px 0">在左侧编辑器输入 Markdown，这里会实时预览微信公众号效果 ✨</p>`;

  async function copyHtml() {
    if (!html) { onToast('没有可复制的内容', 'error'); return; }
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([contentRef.current?.innerText || ''], { type: 'text/plain' }),
        }),
      ]);
      setCopySuccess(true);
      onToast('已复制带样式 HTML，可直接粘贴到微信编辑器', 'success');
    } catch {
      try {
        await navigator.clipboard.writeText(html);
        setCopySuccess(true);
        onToast('已复制 HTML 代码', 'success');
      } catch {
        onToast('复制失败，请手动选择内容复制', 'error');
      }
    }
    setTimeout(() => setCopySuccess(false), 2000);
  }

  function downloadHtml() {
    if (!html) { onToast('没有可下载的内容', 'error'); return; }
    const full = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${sessionTitle}</title><style>body{margin:0;padding:20px;background:#f7f7f7;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif}.c{max-width:680px;margin:0 auto;background:#fff;padding:32px;border-radius:8px}</style></head><body><div class="c">${html}</div></body></html>`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([full], { type: 'text/html;charset=utf-8' }));
    a.download = `${sessionTitle}.html`;
    a.click();
    onToast('HTML 文件已下载', 'success');
  }

  async function exportImage() {
    if (!contentRef.current || !html) { onToast('没有可导出的内容', 'error'); return; }
    setIsExporting(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(contentRef.current, { scale: 2, useCORS: true, backgroundColor: '#fff', logging: false });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${sessionTitle}.png`;
      a.click();
      onToast('图片已导出', 'success');
    } catch (e: any) {
      onToast('导出失败: ' + e.message, 'error');
    } finally {
      setIsExporting(false);
    }
  }

  const actionBtn: React.CSSProperties = {
    padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-main)', cursor: 'pointer', fontSize: 12, color: 'var(--text-primary)',
    transition: 'all 150ms', whiteSpace: 'nowrap',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
      {/* 操作栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', flexShrink: 0, flexWrap: 'wrap' }}>
        <button style={{ ...actionBtn, ...(copySuccess ? { background: '#38a169', color: '#fff', borderColor: '#38a169' } : {}) }} onClick={copyHtml}>
          {copySuccess ? '✅ 已复制' : '📋 一键复制'}
        </button>
        <button style={actionBtn} onClick={downloadHtml}>💾 下载 HTML</button>
        <button style={{ ...actionBtn, ...(isExporting ? { opacity: .5 } : {}) }} onClick={exportImage} disabled={isExporting}>
          {isExporting ? '⏳ 导出中...' : '🖼️ 导出图片'}
        </button>
        <button style={{ ...actionBtn, ...(isConverting ? { opacity: .5 } : {}) }} onClick={onRefresh} disabled={isConverting}>
          {isConverting ? '⏳' : '🔄'} 刷新
        </button>
      </div>

      {/* 预览内容 */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#f7f7f7', padding: 20 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', background: '#fff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', padding: '32px 28px', minHeight: 200 }}>
          <div
            ref={contentRef}
            style={{ fontFamily: '-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif', fontSize: 16, lineHeight: 1.75, color: '#333', wordBreak: 'break-word' }}
            dangerouslySetInnerHTML={{ __html: html || placeholder }}
          />
        </div>
      </div>
    </div>
  );
}
