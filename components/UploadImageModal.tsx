'use client';
import { useState, useRef } from 'react';

interface Props {
  wechatAppid: string;
  wechatSecret: string;
  onInsert: (url: string) => void;
  onClose: () => void;
  onToast: (msg: string, type: 'success'|'error'|'info') => void;
}

export default function UploadImageModal({ wechatAppid, wechatSecret, onInsert, onClose, onToast }: Props) {
  const [target, setTarget] = useState<'smms'|'wechat'>('smms');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) upload(f);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) upload(f);
  }

  async function upload(file: File) {
    if (!['image/jpeg','image/png','image/gif'].includes(file.type)) { setErrMsg('只支持 JPG、PNG、GIF 格式'); return; }
    if (file.size > 5*1024*1024) { setErrMsg('图片大小不能超过 5MB'); return; }
    setUploading(true); setErrMsg(''); setUploadedUrl('');

    // 转 base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    try {
      if (target === 'smms') {
        const r = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type, filename: file.name }),
        });
        const d = await r.json();
        if (d.success) { setUploadedUrl(d.data.url); onToast('图片上传成功', 'success'); }
        else throw new Error(d.error?.message || '上传失败');
      } else {
        if (!wechatAppid || !wechatSecret) throw new Error('请先配置微信 API');
        const r = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type, filename: file.name, appid: wechatAppid, secret: wechatSecret, target: 'wechat' }),
        });
        const d = await r.json();
        if (d.success) { setUploadedUrl(d.data.url || ''); onToast('图片上传成功', 'success'); }
        else throw new Error(d.error?.message || '上传失败');
      }
    } catch (e: any) {
      setErrMsg(e.message);
    } finally { setUploading(false); }
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(uploadedUrl);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(2px)' }} onClick={onClose}>
      <div style={{ background: 'var(--bg-main)', borderRadius: 12, width: 460, boxShadow: 'var(--shadow-lg)', overflow: 'hidden', animation: 'modalIn .2s ease' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', fontSize: 15, fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
          <span>🖼️ 上传图片</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14 }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>
          {/* 图床选择 */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>图床选择</label>
            {[['smms','SM.MS（免费，推荐）'],['wechat','微信素材库（需配置 API）']].map(([v,l]) => (
              <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginBottom: 6 }}>
                <input type="radio" value={v} checked={target === v} onChange={() => setTarget(v as any)} />
                {l}
              </label>
            ))}
          </div>

          {/* 拖拽区 */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{ border: `2px dashed ${dragging || uploadedUrl ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 8, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'rgba(7,193,96,.04)' : 'var(--bg-secondary)', minHeight: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 200ms' }}
          >
            {uploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: 13 }}>
                <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                上传中...
              </div>
            ) : uploadedUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
                <img src={uploadedUrl} style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 4, objectFit: 'contain' }} alt="预览" />
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
                <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>拖拽图片到这里上传</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>或点击选择文件</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8 }}>支持: JPG, PNG, GIF（最大 5MB）</div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif" style={{ display: 'none' }} onChange={handleChange} />

          {uploadedUrl && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>图片链接（点击复制）：</div>
              <div onClick={copyUrl} style={{ padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12, fontFamily: 'var(--font-code)', wordBreak: 'break-all', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span>{uploadedUrl}</span>
                <span style={{ fontSize: 11, color: 'var(--primary)', whiteSpace: 'nowrap', flexShrink: 0 }}>{copied ? '已复制' : '点击复制'}</span>
              </div>
              <button onClick={() => { onInsert(uploadedUrl); onClose(); }} style={{ marginTop: 10, padding: '7px 16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                📝 插入到编辑器
              </button>
            </div>
          )}
          {errMsg && <div style={{ padding: '8px 12px', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 4, fontSize: 13, color: '#c53030', marginTop: 10 }}>❌ {errMsg}</div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <button onClick={onClose} style={{ padding: '7px 20px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-main)', cursor: 'pointer', fontSize: 13 }}>关闭</button>
        </div>
      </div>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(.95) translateY(-10px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}
