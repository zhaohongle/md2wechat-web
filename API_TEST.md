# API 测试文档

## 测试草稿创建

### 请求示例

```bash
curl -X POST https://md2wechat-web.vercel.app/api/draft \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "---\ntitle: 测试文章\nauthor: 作者\n---\n\n# 测试\n\n这是一篇测试文章。",
    "theme": "default",
    "appid": "wxcd62fd9acc29ea50",
    "secret": "1f7090d2f040f59adcf1744e62649b78"
  }'
```

### 响应示例

成功：
```json
{
  "success": true,
  "data": {
    "media_id": "...",
    "title": "测试文章",
    "author": "作者",
    "digest": "这是一篇测试文章。",
    "message": "草稿创建成功，请在微信公众平台查看"
  }
}
```

失败：
```json
{
  "success": false,
  "error": {
    "message": "草稿创建失败",
    "hint": "...",
    "details": "..."
  }
}
```

## 测试封面图上传

### 请求示例

```bash
curl -X POST https://md2wechat-web.vercel.app/api/upload \
  -F "file=@/path/to/image.jpg"
```

### 响应示例

成功：
```json
{
  "success": true,
  "data": {
    "path": "/tmp/uploads/cover-1234567890.jpg",
    "filename": "cover-1234567890.jpg",
    "size": 123456,
    "type": "image/jpeg"
  }
}
```
