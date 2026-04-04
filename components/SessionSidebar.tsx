'use client';
import { useState, useRef, useEffect } from 'react';
import type { Session } from '@/lib/useStore';

interface Props {
  sessions: Session[];
  activeId: string;
  onSwitch: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onOpenSettings: () => void;
}

function formatDate(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
}

export default function SessionSidebar({ sessions, activeId, onSwitch, onCreate, onRename, onDelete, onOpenSettings }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; id: string } | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; value: string } | null>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hide = () => setCtxMenu(null);
    document.addEventListener('click', hide);
    return () => document.removeEventListener('click', hide);
  }, []);

  useEffect(() => {
    if (renaming) renameRef.current?.select();
  }, [renaming]);

  return (
    <>
      <aside style={{
        display: 'flex', flexDirection: 'column',
        width: collapsed ? 52 : 210, minWidth: collapsed ? 52 : 210,
        background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
        transition: 'width 250ms cubic-bezier(.4,0,.2,1)', overflow: 'hidden', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 14px', fontWeight: 700, fontSize: 15, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>✍️</span>
          {!collapsed && <span style={{ color: 'var(--text-primary)' }}>MD2WeChat</span>}
        </div>

        {/* 新建 */}
        <button onClick={onCreate} title="新建文章" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          margin: '10px 10px 6px', padding: '7px 12px',
          borderRadius: 'var(--radius-sm)', background: 'var(--primary)',
          color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          whiteSpace: 'nowrap', overflow: 'hidden',
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>＋</span>
          {!collapsed && <span>新建文章</span>}
        </button>

        {/* 会话列表 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 6px' }}>
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => onSwitch(s.id)}
              onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, id: s.id }); }}
              title={s.title}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginBottom: 2,
                background: s.id === activeId ? 'var(--primary)' : 'transparent',
                color: s.id === activeId ? '#fff' : 'var(--text-primary)',
                transition: 'background 150ms', position: 'relative',
              }}
              className="session-item-hover"
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>📝</span>
              {!collapsed && (
                <>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
                    <div style={{ fontSize: 11, opacity: .6, marginTop: 2 }}>{formatDate(s.updatedAt)}</div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); if (confirm('确认删除？')) onDelete(s.id); }}
                    style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: '2px 4px', borderRadius: 3, color: 'inherit', opacity: .5, flexShrink: 0 }}
                    className="delete-btn"
                  >✕</button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* 底部 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderTop: '1px solid var(--border)' }}>
          <button onClick={onOpenSettings} title="设置" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, whiteSpace: 'nowrap' }}>
            ⚙️{!collapsed && ' 设置'}
          </button>
          <button onClick={() => setCollapsed(c => !c)} style={{ background: 'none', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 14, padding: '3px 7px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>
      </aside>

      {/* 右键菜单 */}
      {ctxMenu && (
        <div style={{ position: 'fixed', top: ctxMenu.y, left: ctxMenu.x, background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)', zIndex: 1000, minWidth: 120, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: '8px 16px', fontSize: 13, cursor: 'pointer', color: 'var(--text-primary)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            onClick={() => { setRenaming({ id: ctxMenu.id, value: sessions.find(s => s.id === ctxMenu.id)?.title || '' }); setCtxMenu(null); }}>
            重命名
          </div>
          <div style={{ padding: '8px 16px', fontSize: 13, cursor: 'pointer', color: '#e53e3e' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fff5f5')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            onClick={() => { if (confirm('确认删除？')) onDelete(ctxMenu.id); setCtxMenu(null); }}>
            删除
          </div>
        </div>
      )}

      {/* 重命名弹窗 */}
      {renaming && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setRenaming(null)}>
          <div style={{ background: 'var(--bg-main)', borderRadius: 12, padding: 24, width: 320, boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>重命名</div>
            <input ref={renameRef} value={renaming.value} onChange={e => setRenaming(r => r ? { ...r, value: e.target.value } : null)}
              onKeyDown={e => { if (e.key === 'Enter') { onRename(renaming.id, renaming.value); setRenaming(null); } if (e.key === 'Escape') setRenaming(null); }}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 14, outline: 'none', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setRenaming(null)} style={{ padding: '6px 16px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: 13 }}>取消</button>
              <button onClick={() => { onRename(renaming.id, renaming.value); setRenaming(null); }} style={{ padding: '6px 16px', borderRadius: 4, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 13 }}>确认</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .session-item-hover:hover { background: var(--bg-main) !important; }
        .session-item-hover:hover .delete-btn { display: block !important; }
      `}</style>
    </>
  );
}
