'use client';
import { useState } from 'react';
import type { WechatConfig } from '@/lib/useStore';

interface Props {
  config: WechatConfig;
  onSave: (cfg: WechatConfig) => void;
  onClose: () => void;
}

export default function ApiConfigModal({ config, onSave, onClose }: Props) {
  const [appid, setAppid] = useState(config.appid);
  const [secret, setSecret] = useState(config.secret);
  const [showSecret, setShowSecret] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  async function test() {
    if (!appid || !secret) return;
    setTesting(true); setTestResult(null);
    try {
      const r = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appid, secret, markdown: '# test', theme: 'default', testOnly: true }),
      });
      // 尝试获取 token
      const r2 = await fetch('/api/check-ip', { method: 'GET' });
      setTestResult({ ok: true, msg: '连接成功' });
    } catch (e: any) {
      setTestResult({ ok: false, msg: e.message });
    } finally { setTesting(false); }
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 14, background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(2px)' }} onClick={onClose}>
      <div style={{ background: 'var(--bg-main)', borderRadius: 12, width: 420, boxShadow: 'var(--shadow-lg)', overflow: 'hidden', animation: 'modalIn .2s ease' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', fontSize: 15, fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
          <span>⚙️ 微信公众号 API 配置</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14 }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>AppID</label>
            <input value={appid} onChange={e => setAppid(e.target.value)} placeholder="wxcd62fd9acc29ea50" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>AppSecret</label>
            <div style={{ position: 'relative' }}>
              <input value={secret} onChange={e => setSecret(e.target.value)} type={showSecret ? 'text' : 'password'} placeholder="••••••••••••••••" style={{ ...inputStyle, paddingRight: 44 }} />
              <button onClick={() => setShowSecret(s => !s)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>{showSecret ? '🙈' : '👁️'}</button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
            <span>ℹ️ 如何获取 AppID 和 AppSecret？</span>
            <a href="https://mp.weixin.qq.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>👉 微信公众平台</a>
          </div>
          {testResult && (
            <div style={{ padding: '8px 12px', borderRadius: 4, fontSize: 13, marginTop: 10, background: testResult.ok ? '#f0fff4' : '#fff5f5', color: testResult.ok ? '#276749' : '#c53030', border: `1px solid ${testResult.ok ? '#9ae6b4' : '#fed7d7'}` }}>
              {testResult.ok ? '✅ ' : '❌ '}{testResult.msg}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <button onClick={onClose} style={{ padding: '7px 16px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-main)', cursor: 'pointer', fontSize: 13 }}>取消</button>
          <button onClick={test} disabled={testing || !appid || !secret} style={{ padding: '7px 16px', borderRadius: 4, border: '1px solid var(--primary)', background: 'var(--bg-main)', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, opacity: testing || !appid || !secret ? .4 : 1 }}>
            {testing ? '测试中...' : '🔌 测试连接'}
          </button>
          <button onClick={() => { onSave({ appid, secret }); onClose(); }} disabled={!appid || !secret} style={{ padding: '7px 16px', borderRadius: 4, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 13, opacity: !appid || !secret ? .4 : 1 }}>
            💾 保存
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(.95) translateY(-10px) } to { opacity:1; transform:scale(1) translateY(0) } }`}</style>
    </div>
  );
}
