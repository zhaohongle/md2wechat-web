'use client';
import { useState, useCallback, useRef, useEffect } from 'react';

export interface Session {
  id: string;
  title: string;
  content: string;
  theme: string;
  customStyles: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

export interface WechatConfig {
  appid: string;
  secret: string;
}

const STORAGE_SESSIONS = 'md2wechat_sessions';
const STORAGE_ACTIVE = 'md2wechat_active';
const STORAGE_CONFIG = 'md2wechat_config';

function loadStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function saveStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function makeSession(title = '新建文章'): Session {
  return {
    id: `s_${Date.now()}`,
    title,
    content: `# ${title}\n\n在这里写你的文章...\n`,
    theme: 'default',
    customStyles: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function extractTitle(md: string): string {
  const m = md.split('\n').find(l => l.startsWith('#'));
  return m ? m.replace(/^#+\s*/, '').trim() : '';
}

export function useStore() {
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = loadStorage<Session[]>(STORAGE_SESSIONS, []);
    return saved.length > 0 ? saved : [makeSession('我的第一篇文章')];
  });
  const [activeId, setActiveId] = useState<string>(() => {
    const saved = loadStorage<string>(STORAGE_ACTIVE, '');
    return saved || sessions[0]?.id || '';
  });
  const [markdown, setMarkdownState] = useState<string>('');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentTheme, setCurrentThemeState] = useState('default');
  const [customStyles, setCustomStylesState] = useState<Record<string, string>>({});
  const [availableThemes, setAvailableThemes] = useState<{id:string;name:string;description:string}[]>([]);
  const [wechatConfig, setWechatConfigState] = useState<WechatConfig>(() =>
    loadStorage(STORAGE_CONFIG, { appid: '', secret: '' })
  );
  const [isConverting, setIsConverting] = useState(false);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(true);
  const [toast, setToast] = useState<{message:string;type:'success'|'error'|'info'}|null>(null);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const convertTimer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const initialized = useRef(false);

  // 初始化：加载激活会话内容
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const session = sessions.find(s => s.id === activeId) || sessions[0];
    if (session) {
      setMarkdownState(session.content);
      setCurrentThemeState(session.theme);
      setCustomStylesState(session.customStyles || {});
      setActiveId(session.id);
    }
    // 加载主题列表
    fetch('/api/themes').then(r => r.json()).then(d => {
      if (d.success) setAvailableThemes(d.data);
    }).catch(() => {});
  }, []);

  // 持久化 sessions
  const persistSessions = useCallback((s: Session[]) => {
    saveStorage(STORAGE_SESSIONS, s);
  }, []);

  // 显示 toast
  const showToast = useCallback((message: string, type: 'success'|'error'|'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // 获取当前会话
  const activeSession = sessions.find(s => s.id === activeId);

  // 更新当前会话内容（不切换）
  const flushCurrentSession = useCallback((md: string, theme: string, styles: Record<string,string>) => {
    setSessions(prev => {
      const next = prev.map(s => {
        if (s.id !== activeId) return s;
        const title = extractTitle(md) || s.title;
        return { ...s, content: md, theme, customStyles: styles, title, updatedAt: Date.now() };
      });
      persistSessions(next);
      return next;
    });
    setLastSaved(new Date());
  }, [activeId, persistSessions]);

  // 设置 markdown（带防抖自动保存 + 实时预览）
  const setMarkdown = useCallback((value: string) => {
    setMarkdownState(value);
    setWordCount(value.replace(/\s/g, '').length);

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      flushCurrentSession(value, currentTheme, customStyles);
    }, 3000);

    if (convertTimer.current) clearTimeout(convertTimer.current);
    convertTimer.current = setTimeout(() => {
      triggerConvert(value, currentTheme, customStyles);
    }, 500);
  }, [currentTheme, customStyles, flushCurrentSession]);

  // 触发转换
  const triggerConvert = useCallback(async (md: string, theme: string, styles: Record<string,string>) => {
    if (!md.trim()) { setPreviewHtml(''); return; }
    setIsConverting(true);
    try {
      const r = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: md, theme, customStyles: styles }),
      });
      const d = await r.json();
      if (d.success) setPreviewHtml(d.data.html);
    } catch {}
    finally { setIsConverting(false); }
  }, []);

  const convertMarkdown = useCallback(() => {
    triggerConvert(markdown, currentTheme, customStyles);
  }, [markdown, currentTheme, customStyles, triggerConvert]);

  // 会话管理
  const createSession = useCallback((title = '新建文章') => {
    flushCurrentSession(markdown, currentTheme, customStyles);
    const s = makeSession(title);
    setSessions(prev => {
      const next = [s, ...prev];
      persistSessions(next);
      return next;
    });
    setActiveId(s.id);
    saveStorage(STORAGE_ACTIVE, s.id);
    setMarkdownState(s.content);
    setCurrentThemeState(s.theme);
    setCustomStylesState({});
    setPreviewHtml('');
  }, [markdown, currentTheme, customStyles, flushCurrentSession, persistSessions]);

  const switchSession = useCallback((id: string) => {
    if (id === activeId) return;
    flushCurrentSession(markdown, currentTheme, customStyles);
    const s = sessions.find(s => s.id === id);
    if (!s) return;
    setActiveId(id);
    saveStorage(STORAGE_ACTIVE, id);
    setMarkdownState(s.content);
    setCurrentThemeState(s.theme);
    setCustomStylesState(s.customStyles || {});
    // 触发预览
    triggerConvert(s.content, s.theme, s.customStyles || {});
  }, [activeId, markdown, currentTheme, customStyles, sessions, flushCurrentSession, triggerConvert]);

  const renameSession = useCallback((id: string, title: string) => {
    setSessions(prev => {
      const next = prev.map(s => s.id === id ? { ...s, title } : s);
      persistSessions(next);
      return next;
    });
  }, [persistSessions]);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      const result = next.length > 0 ? next : [makeSession()];
      persistSessions(result);
      if (id === activeId) {
        const first = result[0];
        setActiveId(first.id);
        saveStorage(STORAGE_ACTIVE, first.id);
        setMarkdownState(first.content);
        setCurrentThemeState(first.theme);
        setCustomStylesState(first.customStyles || {});
      }
      return result;
    });
  }, [activeId, persistSessions]);

  // 主题管理
  const setTheme = useCallback((themeId: string) => {
    setCurrentThemeState(themeId);
    setCustomStylesState({});
    triggerConvert(markdown, themeId, {});
  }, [markdown, triggerConvert]);

  const updateCustomStyle = useCallback((key: string, value: string) => {
    setCustomStylesState(prev => {
      const next = { ...prev, [key]: value };
      if (convertTimer.current) clearTimeout(convertTimer.current);
      convertTimer.current = setTimeout(() => triggerConvert(markdown, currentTheme, next), 300);
      return next;
    });
  }, [markdown, currentTheme, triggerConvert]);

  const resetCustomStyles = useCallback(() => {
    setCustomStylesState({});
    triggerConvert(markdown, currentTheme, {});
  }, [markdown, currentTheme, triggerConvert]);

  // 微信配置
  const saveWechatConfig = useCallback((cfg: WechatConfig) => {
    setWechatConfigState(cfg);
    saveStorage(STORAGE_CONFIG, cfg);
  }, []);

  // 创建草稿
  const createDraft = useCallback(async (params?: {
    title?: string; author?: string; digest?: string; thumbMediaId?: string;
  }) => {
    if (!wechatConfig.appid || !wechatConfig.secret) {
      showToast('请先配置微信 AppID 和 AppSecret', 'error');
      return null;
    }
    setIsCreatingDraft(true);
    try {
      const r = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appid: wechatConfig.appid,
          secret: wechatConfig.secret,
          markdown,
          theme: currentTheme,
          customStyles,
          ...params,
        }),
      });
      const d = await r.json();
      if (d.success) {
        showToast(`草稿创建成功：${d.data.title}`, 'success');
        return d.data;
      } else {
        showToast(d.error?.message || '创建失败', 'error');
        return null;
      }
    } catch (e: any) {
      showToast(e.message, 'error');
      return null;
    } finally {
      setIsCreatingDraft(false);
    }
  }, [wechatConfig, markdown, currentTheme, customStyles, showToast]);

  return {
    sessions, activeId, activeSession,
    markdown, setMarkdown,
    previewHtml, wordCount, lastSaved,
    currentTheme, availableThemes, customStyles,
    setTheme, updateCustomStyle, resetCustomStyles,
    wechatConfig, saveWechatConfig,
    isConverting, isCreatingDraft,
    isThemePanelOpen, setIsThemePanelOpen,
    toast, showToast,
    createSession, switchSession, renameSession, deleteSession,
    convertMarkdown, createDraft,
  };
}
