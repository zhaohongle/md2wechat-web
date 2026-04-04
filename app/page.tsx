'use client';

import { useState } from 'react';
import { useStore } from '@/lib/useStore';
import SessionSidebar from '@/components/SessionSidebar';
import MarkdownEditor from '@/components/MarkdownEditor';
import PreviewPanel from '@/components/PreviewPanel';
import ThemePanel from '@/components/ThemePanel';
import ApiConfigModal from '@/components/ApiConfigModal';
import CreateDraftModal from '@/components/CreateDraftModal';
import UploadImageModal from '@/components/UploadImageModal';

export default function Home() {
  const store = useStore();
  const [isDark, setIsDark] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [showCreateDraft, setShowCreateDraft] = useState(false);
  const [showUploadImage, setShowUploadImage] = useState(false);

  function toggleDark() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  }

  function insertImageUrl(url: string) {
    store.setMarkdown(store.markdown + `\n![图片](${url})\n`);
  }

  const headerBtn: React.CSSProperties = {
    padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: 13,
    color: 'var(--text-primary)', transition: 'all 150ms', whiteSpace: 'nowrap',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>

      {/* ─── Header ─── */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 52, minHeight: 52, background: 'var(--bg-main)', borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', zIndex: 100, flexShrink: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 700 }}>✍️ MD2WeChat Pro</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={headerBtn} onClick={() => setShowApiConfig(true)}>⚙️ API 配置</button>
          <button
            style={{ ...headerBtn, background: store.markdown.trim() ? 'var(--primary)' : 'var(--bg-secondary)', color: store.markdown.trim() ? '#fff' : 'var(--text-secondary)', borderColor: store.markdown.trim() ? 'var(--primary)' : 'var(--border)', opacity: store.markdown.trim() ? 1 : .5 }}
            onClick={() => store.markdown.trim() && setShowCreateDraft(true)}
            disabled={!store.markdown.trim()}
          >
            📤 创建草稿
          </button>
          <button style={{ ...headerBtn, padding: '6px 10px' }} onClick={toggleDark} title={isDark ? '切换亮色' : '切换暗色'}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* ─── Body ─── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <SessionSidebar
          sessions={store.sessions}
          activeId={store.activeId}
          onSwitch={store.switchSession}
          onCreate={store.createSession}
          onRename={store.renameSession}
          onDelete={store.deleteSession}
          onOpenSettings={() => setShowApiConfig(true)}
        />
        <MarkdownEditor
          value={store.markdown}
          onChange={store.setMarkdown}
          wordCount={store.wordCount}
          lastSaved={store.lastSaved}
          onUploadImage={() => setShowUploadImage(true)}
          isDark={isDark}
        />
        <PreviewPanel
          html={store.previewHtml}
          isConverting={store.isConverting}
          sessionTitle={store.activeSession?.title || '文章'}
          onRefresh={store.convertMarkdown}
          onToast={store.showToast}
        />
        <ThemePanel
          isOpen={store.isThemePanelOpen}
          onToggle={() => store.setIsThemePanelOpen(!store.isThemePanelOpen)}
          themes={store.availableThemes}
          currentTheme={store.currentTheme}
          customStyles={store.customStyles}
          onSetTheme={store.setTheme}
          onUpdateStyle={store.updateCustomStyle}
          onReset={store.resetCustomStyles}
        />
      </div>

      {/* ─── Toast ─── */}
      {store.toast && (
        <div style={{
          position: 'fixed', top: 64, left: '50%', transform: 'translateX(-50%)',
          padding: '10px 20px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 500,
          zIndex: 9999, boxShadow: 'var(--shadow-md)', whiteSpace: 'nowrap', pointerEvents: 'none',
          background: store.toast.type === 'success' ? '#38a169' : store.toast.type === 'error' ? '#e53e3e' : '#3182ce',
          color: '#fff',
          animation: 'toastIn .25s cubic-bezier(.34,1.56,.64,1)',
        }}>
          {store.toast.message}
        </div>
      )}

      {/* ─── Modals ─── */}
      {showApiConfig && (
        <ApiConfigModal
          config={store.wechatConfig}
          onSave={store.saveWechatConfig}
          onClose={() => setShowApiConfig(false)}
        />
      )}
      {showCreateDraft && (
        <CreateDraftModal
          markdown={store.markdown}
          isCreating={store.isCreatingDraft}
          hasConfig={!!(store.wechatConfig.appid && store.wechatConfig.secret)}
          onCreate={store.createDraft}
          onClose={() => setShowCreateDraft(false)}
        />
      )}
      {showUploadImage && (
        <UploadImageModal
          wechatAppid={store.wechatConfig.appid}
          wechatSecret={store.wechatConfig.secret}
          onInsert={insertImageUrl}
          onClose={() => setShowUploadImage(false)}
          onToast={store.showToast}
        />
      )}

      <style>{`
        @keyframes toastIn {
          from { opacity:0; transform:translateX(-50%) translateY(-12px) scale(.95) }
          to   { opacity:1; transform:translateX(-50%) translateY(0) scale(1) }
        }
      `}</style>
    </div>
  );
}
