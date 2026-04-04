'use client';
import { useState, useMemo } from 'react';

interface Props {
  markdown: string;
  isCreating: boolean;
  hasConfig: boolean;
  onCreate: (params: { title?: string; author?: string; digest?: string; thumbMediaId?: string }) => Promise<any>;
  onClose: () => void;
}

export default function CreateDraftModal({ markdown, isCreating, hasConfig, onCreate, onClose }: Props) {
  const autoTitle = useMemo(() => {
    const m = markdown.split('\n').find(l => l.startsWith('#'));
    return m ? m.replace(/^#+\s*/, '').trim() : '未命名文章';
  }, [markdown]);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [digest, setDigest] = useState('');
  const [thumbMediaId, setThumbMediaId] = useState('');
  const [result, setResult] = useState<{ mediaId: string; title: string } | null>(null);
  const [errMsg, setErrMsg] = useState('');

  async function submit() {
    setErrMsg('');
    const res = await onCreate({ title: title || autoTitle, author: author || undefined, digest: digest || undefined, thumbMediaId: thumbMediaId || undefined });
    if (res) setResult(res);
    else setErrMsg('创建失败，请检查 API 配置或网络连接');
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 14, background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(2px)' }} onClick={onClose}>
      <div style={{ background: 'var(--bg-main)', borderRadius: 12, width: 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)', animation: 'modalIn .2s ease' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', fontSize: 15, fontWeight: 600, borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--bg-main)', zIndex: 1 }}>
          <span>📤 创建微信草稿</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14 }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>
          {!hasConfig && <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: 4, fontSize: 13, color: '#744210', marginBottom: 16 }}>⚠️ 请先配置微信 API（点击右上角 ⚙️ API 配置）</div>}

          <FormGroup label="文章标题" hint="最多 32 字">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder={autoTitle} maxLength={32} style={inputStyle} />
          </FormGroup>
          <FormGroup label="作者" hint="最多 16 字，可选">
            <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="作者名称" maxLength={16} style={inputStyle} />
          </FormGroup>
          <FormGroup label="摘要" hint="最多 128 字，留空则自动生成">
            <textarea value={digest} onChange={e => setDigest(e.target.value)} placeholder="留空将自动从正文提取前 120 字..." maxLength={128} rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
          </FormGroup>
          <FormGroup label="封面图 Media ID" hint="可选">
            <input value={thumbMediaId} onChange={e => setThumbMediaId(e.target.value)} placeholder="永久素材的 media_id" style={inputStyle} />
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>需要先在微信公众平台上传封面图，获取 media_id</div>
          </FormGroup>

          {result && (
            <div style={{ padding: 14, background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: 4, marginTop: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#276749', marginBottom: 8 }}>✅ 草稿创建成功！</div>
              <div style={{ fontSize: 13, color: '#276749', marginBottom: 4 }}><b>标题：</b>{result.title}</div>
              <div style={{ fontSize: 13, color: '#276749', wordBreak: 'break-all' }}><b>Media ID：</b><code style={{ fontFamily: 'var(--font-code)', fontSize: 12, background: 'rgba(0,0,0,.06)', padding: '1px 4px', borderRadius: 3 }}>{result.mediaId}</code></div>
              <div style={{ fontSize: 12, color: '#38a169', marginTop: 8 }}>请前往微信公众平台草稿箱查看 →</div>
            </div>
          )}
          {errMsg && <div style={{ padding: '8px 12px', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 4, fontSize: 13, color: '#c53030', marginTop: 8 }}>❌ {errMsg}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', position: 'sticky', bottom: 0 }}>
          <button onClick={onClose} style={{ padding: '7px 20px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-main)', cursor: 'pointer', fontSize: 13 }}>{result ? '关闭' : '取消'}</button>
          {!result && <button onClick={submit} disabled={isCreating || !hasConfig} style={{ padding: '7px 20px', borderRadius: 4, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 13, minWidth: 100, opacity: isCreating || !hasConfig ? .4 : 1 }}>
            {isCreating ? '⏳ 创建中...' : '📤 创建草稿'}
          </button>}
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(.95) translateY(-10px) } to { opacity:1; transform:scale(1) translateY(0) } }`}</style>
    </div>
  );
}

function FormGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
        {label} {hint && <span style={{ fontWeight: 400, opacity: .7 }}>（{hint}）</span>}
      </label>
      {children}
    </div>
  );
}
