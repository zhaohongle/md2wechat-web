# Vercel 动态 IP 问题解决方案

## 问题说明

Vercel 使用动态出口 IP，每次部署或请求可能使用不同的 IP 地址。这导致需要频繁更新微信公众平台的 IP 白名单。

## 已知 Vercel IP（美国区域）

添加以下 IP 到微信白名单（最多 3 个）：

1. `98.84.46.252` ✅
2. `98.80.137.236` ⏳ **当前需要添加**
3. `104.192.108.9` ✅

## 解决方案

### 方案 1：添加 Vercel 常见 IP 段（推荐）

如果微信支持 CIDR 格式，可以添加 Vercel 的 IP 段：
- `98.80.0.0/16`
- `98.84.0.0/16`

**注意：** 微信公众平台目前不支持 CIDR，只能添加单个 IP。

### 方案 2：使用代理服务器（固定 IP）

架构：
```
Vercel → 固定IP代理 → 微信API
```

**优点：**
- 只需配置一个固定 IP
- 不受 Vercel IP 变化影响

**缺点：**
- 需要额外的服务器成本
- 增加一层网络延迟

**实现步骤：**

1. 购买固定 IP 的 VPS（阿里云/腾讯云/AWS）

2. 搭建代理服务（示例：nginx）:
```nginx
location /wechat-api/ {
    proxy_pass https://api.weixin.qq.com/;
    proxy_set_header Host api.weixin.qq.com;
}
```

3. 修改代码，所有微信 API 请求通过代理：
```typescript
const WECHAT_PROXY = process.env.WECHAT_PROXY_URL; // https://your-proxy.com/wechat-api
```

### 方案 3：Railway 部署（固定 IP）

Railway 提供固定 IP（企业版）。

**步骤：**
1. 注册 Railway：https://railway.app/
2. 导入 GitHub 仓库
3. 配置环境变量
4. 部署

**优点：**
- 固定 IP
- 类似 Vercel 的部署体验

**缺点：**
- 需要付费（企业版 $20/月）

### 方案 4：AWS Lambda + API Gateway + Elastic IP

最稳定但配置复杂。

**优点：**
- 完全固定 IP
- 高可用性

**缺点：**
- 配置复杂
- 成本较高

## 当前建议

**开发/测试阶段：**
- 使用 Vercel，遇到 IP 变化时手动添加
- 保留 3 个最常见的 IP

**生产环境：**
- 使用方案 2（代理服务器）或方案 3（Railway）
- 确保稳定性

## 自动检测 IP

访问以下 API 查看当前 Vercel IP：
```bash
curl https://md2wechat-web.vercel.app/api/check-ip
```

## 临时解决方案

如果频繁遇到 IP 问题，可以：

1. **使用本地开发服务器**
```bash
git clone https://github.com/zhaohongle/md2wechat-web.git
cd md2wechat-web
npm install
npm run dev
# 访问 http://localhost:3000
```

2. **配置本机 IP 白名单**
```bash
# 查看本机公网 IP
curl ifconfig.me

# 添加到微信白名单
```

## 长期方案对比

| 方案 | 成本 | 稳定性 | 配置难度 |
|------|------|--------|----------|
| Vercel（当前） | 免费 | ⭐⭐ | ⭐ |
| 代理服务器 | $5-20/月 | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Railway | $20/月 | ⭐⭐⭐⭐ | ⭐⭐ |
| AWS Lambda | $10-30/月 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

**当前状态：** 需要添加 `98.80.137.236` 到微信白名单
