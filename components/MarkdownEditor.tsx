'use client';
import { useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  wordCount: number;
  lastSaved: Date | null;
  onUploadImage: () => void;
  isDark: boolean;
}

export default function MarkdownEditor({ value, onChange, wordCount, lastSaved, onUploadImage, isDark }: Props) {
  const editorRef = useRef<any>(null);

  function insertText(before: string, after = '', placeholder = '') {
    const editor = editorRef.current;
    if (!editor) return;
    const sel = editor.getSelection();
    const selected = editor.getModel()?.getValueInRange(sel) || placeholder;
    editor.executeEdits('', [{ range: sel, text: `${before}${selected}${after}` }]);
    editor.focus();
  }

  function insertHeading(level: number) {
    const editor = editorRef.current;
    if (!editor) return;
    const pos = editor.getPosition();
    const line = editor.getModel()?.getLineContent(pos.lineNumber) || '';
    const prefix = '#'.repeat(level) + ' ';
    editor.executeEdits('', [{ range: { startLineNumber: pos.lineNumber, startColumn: 1, endLineNumber: pos.lineNumber, endColumn: 1 }, text: prefix }]);
    editor.focus();
  }

  function insertCodeBlock() {
    const editor = editorRef.current;
    if (!editor) return;
    const sel = editor.getSelection();
    const selected = editor.getModel()?.getValueInRange(sel) || '';
    if (selected.includes('\n')) {
      editor.executeEdits('', [{ range: sel, text: `\`\`\`\n${selected}\n\`\`\`` }]);
    } else {
      editor.executeEdits('', [{ range: sel, text: `\`${selected || 'code'}\`` }]);
    }
    editor.focus();
  }

  function insertLink() {
    const url = prompt('输入链接 URL:', 'https://');
    if (url) insertText('[', `](${url})`, '链接文字');
  }

  function clearContent() {
    if (!confirm('确认清空全部内容？')) return;
    onChange('');
  }

  function formatTime(d: Date) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  const toolBtn: React.CSSProperties = {
    padding: '4px 8px', border: '1px solid transparent', borderRadius: 'var(--radius-sm)',
    background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
    color: 'var(--text-secondary)', transition: 'all 150ms', lineHeight: 1,
  };

  const divider = <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
      {/* 工具栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', flexShrink: 0, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {[1,2,3].map(n => <button key={n} style={toolBtn} onClick={() => insertHeading(n)} title={`H${n}`}>H{n}</button>)}
        </div>
        {divider}
        <div style={{ display: 'flex', gap: 2 }}>
          <button style={toolBtn} onClick={() => insertText('**','**','加粗文字')}><b>B</b></button>
          <button style={toolBtn} onClick={() => insertText('*','*','斜体文字')}><i>I</i></button>
          <button style={{ ...toolBtn, fontFamily: 'var(--font-code)', fontSize: 11 }} onClick={insertCodeBlock}>&lt;/&gt;</button>
        </div>
        {divider}
        <div style={{ display: 'flex', gap: 2 }}>
          <button style={toolBtn} onClick={insertLink} title="插入链接">🔗</button>
          <button style={toolBtn} onClick={onUploadImage} title="上传图片">🖼️</button>
          <button style={toolBtn} onClick={() => insertText('> ','','引用内容')} title="引用">❝</button>
        </div>
        {divider}
        <button style={{ ...toolBtn, color: '#e53e3e' }} onClick={clearContent} title="清空内容">🗑️</button>
      </div>

      {/* Monaco 编辑器 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <MonacoEditor
          height="100%"
          defaultLanguage="markdown"
          value={value}
          onChange={v => onChange(v || '')}
          theme={isDark ? 'vs-dark' : 'vs-light'}
          onMount={editor => { editorRef.current = editor; }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            fontFamily: 'var(--font-code)',
          }}
        />
      </div>

      {/* 状态栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 16px', fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <span>字数: {wordCount}</span>
        <span>{lastSaved ? `最后保存: ${formatTime(lastSaved)}` : '尚未保存'}</span>
      </div>
    </div>
  );
}
