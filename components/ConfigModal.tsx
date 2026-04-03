'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ConfigModalProps {
  onClose: () => void;
}

export default function ConfigModal({ onClose }: ConfigModalProps) {
  const [appid, setAppid] = useState('');
  const [secret, setSecret] = useState('');

  useEffect(() => {
    // 从 localStorage 加载配置
    const savedAppid = localStorage.getItem('wechat_appid') || '';
    const savedSecret = localStorage.getItem('wechat_secret') || '';
    setAppid(savedAppid);
    setSecret(savedSecret);
  }, []);

  const handleSave = () => {
    localStorage.setItem('wechat_appid', appid);
    localStorage.setItem('wechat_secret', secret);
    alert('配置已保存');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">微信公众号配置</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AppID
            </label>
            <input
              type="text"
              value={appid}
              onChange={(e) => setAppid(e.target.value)}
              placeholder="wx..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AppSecret
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
            ⚠️ 配置保存在浏览器本地，请勿在公共设备上使用。
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
