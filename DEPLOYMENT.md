# 部署说明

## Vercel 部署

### IP 白名单配置

**重要：** Vercel 部署后需要将出口 IP 添加到微信公众平台白名单。

#### 如何获取 Vercel IP

方式 1：查看错误信息
```json
{
  "error": {
    "details": "invalid ip 98.84.46.252 ..."
  }
}
```

方式 2：访问 IP 检测 API
```bash
curl https://md2wechat-web.vercel.app/api/check-ip
```

#### 添加 IP 到微信白名单

1. 登录微信公众平台：https://mp.weixin.qq.com/
2. 开发 → 基本配置 → IP 白名单
3. 点击"修改"，添加 Vercel IP
4. 微信扫码确认

**已知 Vercel IP：**
- `98.84.46.252`（美国区域）
- `218.30.116.61`（中国区域，如果使用 VPN）

#### 注意事项

⚠️ **Vercel IP 可能变化**

- Vercel 的出口 IP 不是固定的
- 建议添加多个常见 IP（最多 3 个）
- 如果频繁遇到问题，考虑使用自建服务器

### 替代方案

**方案 1：使用代理服务器**
- 搭建固定 IP 的代理服务器
- 所有微信 API 请求通过代理转发

**方案 2：使用 Railway 部署**
- Railway 提供固定 IP（企业版）
- 更适合需要固定 IP 的场景

**方案 3：使用 AWS Lambda + API Gateway**
- 配置固定 Elastic IP
- 更稳定但配置复杂

## 本地开发

本地开发时，使用你的本机公网 IP：

```bash
# 查看本机 IP
curl ifconfig.me

# 添加到微信白名单
# https://mp.weixin.qq.com/ → 开发 → 基本配置 → IP 白名单
```

## 环境变量

生产环境建议使用环境变量而非前端 localStorage：

```bash
# Vercel 环境变量
WECHAT_APPID=wx...
WECHAT_SECRET=...
```

然后在代码中读取：
```typescript
const appid = process.env.WECHAT_APPID;
const secret = process.env.WECHAT_SECRET;
```

**安全提示：** 不要在前端代码中暴露 AppSecret！
