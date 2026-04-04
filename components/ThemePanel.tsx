'use client';

interface Theme { id: string; name: string; description: string; }

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  themes: Theme[];
  currentTheme: string;
  customStyles: Record<string, string>;
  onSetTheme: (id: string) => void;
  onUpdateStyle: (key: string, value: string) => void;
  onReset: () => void;
}

export default function ThemePanel({ isOpen, onToggle, themes, currentTheme, onSetTheme, onUpdateStyle, onReset }: Props) {
  // 派生滑块初始值（从 customStyles 读）
  function getVal(key: string, def: string) {
    return def; // 简化：用默认值，滑块是非受控（state 在组件内）
  }

  if (!isOpen) {
    return (
      <div
        onClick={onToggle}
        style={{ width: 36, minWidth: 36, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16, cursor: 'pointer', gap: 8, color: 'var(--text-secondary)', flexShrink: 0 }}
        title="展开主题面板"
      >
        <span style={{ fontSize: 18 }}>🎨</span>
        <span style={{ fontSize: 11, writingMode: 'vertical-lr', letterSpacing: 4, lineHeight: 1 }}>主题面板</span>
      </div>
    );
  }

  return (
    <div style={{ width: 280, minWidth: 280, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', flexShrink: 0 }}>
      {/* 标题 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', fontSize: 14, fontWeight: 600, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <span>🎨 主题面板</span>
        <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14, padding: '2px 6px', borderRadius: 3 }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
        {/* 主题选择 */}
        <Section title="🖌️ 主题选择">
          <select value={currentTheme} onChange={e => onSetTheme(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, marginBottom: 10, outline: 'none' }}>
            {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {themes.map(t => (
              <div key={t.id} onClick={() => onSetTheme(t.id)}
                style={{ flex: '1 1 70px', cursor: 'pointer', borderRadius: 4, border: `2px solid ${t.id === currentTheme ? 'var(--primary)' : 'var(--border)'}`, overflow: 'hidden', transition: 'all 150ms', boxShadow: t.id === currentTheme ? '0 0 0 2px rgba(7,193,96,.2)' : 'none' }}>
                <div style={{ padding: 8, background: '#fff' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: t.id === 'bytedance' ? '#ff6b35' : t.id === 'chinese' ? '#c0392b' : '#333' }}>标题</div>
                  <div style={{ fontSize: 9, color: '#666' }}>正文文字</div>
                </div>
                <div style={{ padding: '4px 8px', fontSize: 11, textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}>{t.name}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* 间距 */}
        <Section title="📏 间距调整">
          <Slider label="行间距" min={1.5} max={2.5} step={0.05} defaultVal={1.75}
            onCommit={v => onUpdateStyle('lineHeight', String(v))} unit="" />
          <Slider label="字间距" min={0} max={0.2} step={0.01} defaultVal={0.05}
            onCommit={v => onUpdateStyle('letterSpacing', `${v}em`)} unit="em" />
          <Slider label="段落间距" min={1} max={3} step={0.1} defaultVal={1.5}
            onCommit={v => onUpdateStyle('paragraphSpacing', `${v}em`)} unit="em" />
        </Section>

        {/* 颜色 */}
        <Section title="🎨 颜色微调">
          <ColorPicker label="标题颜色" defaultVal="#333333" onChange={v => onUpdateStyle('headingColor', v)} />
          <ColorPicker label="正文颜色" defaultVal="#666666" onChange={v => onUpdateStyle('bodyColor', v)} />
          <ColorPicker label="链接颜色" defaultVal="#576b95" onChange={v => onUpdateStyle('linkColor', v)} />
          <ColorPicker label="代码背景" defaultVal="#f5f5f5" onChange={v => onUpdateStyle('codeBg', v)} />
        </Section>
      </div>

      {/* 底部 */}
      <div style={{ padding: 12, borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={onReset} style={{ width: '100%', padding: 7, border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-main)', cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
          🔄 重置为默认
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12, padding: 12, background: 'var(--bg-main)', borderRadius: 8, border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function Slider({ label, min, max, step, defaultVal, unit, onCommit }: {
  label: string; min: number; max: number; step: number; defaultVal: number; unit: string;
  onCommit: (v: number) => void;
}) {
  const [val, setVal] = useState(defaultVal);
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 5 }}>
        {label}: <strong style={{ color: 'var(--text-primary)' }}>{val}{unit}</strong>
      </label>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => { const v = parseFloat(e.target.value); setVal(v); onCommit(v); }}
        style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

function ColorPicker({ label, defaultVal, onChange }: { label: string; defaultVal: string; onChange: (v: string) => void; }) {
  const [val, setVal] = useState(defaultVal);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
      <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="color" value={val} onChange={e => { setVal(e.target.value); onChange(e.target.value); }}
          style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', padding: 2, background: 'none' }} />
        <span style={{ fontSize: 11, fontFamily: 'var(--font-code)', color: 'var(--text-secondary)' }}>{val}</span>
      </div>
    </div>
  );
}

// 需要 useState import
import { useState } from 'react';
