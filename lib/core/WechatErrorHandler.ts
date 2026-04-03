/**
 * 微信 API 错误码映射
 * 提供友好的错误信息和解决方案
 */

export interface WechatError {
  code: number;
  message: string;
  hint?: string;
  docsUrl?: string;
}

export class WechatErrorHandler {
  private static errorMap: Map<number, WechatError> = new Map([
    // 通用错误
    [-1, {
      code: -1,
      message: '系统繁忙，此时请开发者稍候再试',
      hint: '请稍后重试',
    }],
    [40001, {
      code: 40001,
      message: 'AppSecret 错误或者 AppSecret 不属于这个公众号',
      hint: '请检查配置文件中的 AppID 和 AppSecret 是否正确\n运行: md2wechat config list',
      docsUrl: 'https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Explanation_of_error_codes.html',
    }],
    [40002, {
      code: 40002,
      message: '不合法的凭证类型',
      hint: '请检查 Access Token 是否有效',
    }],
    [40003, {
      code: 40003,
      message: '不合法的 OpenID',
      hint: '请检查 OpenID 是否正确',
    }],
    [40013, {
      code: 40013,
      message: '不合法的 AppID',
      hint: '请检查配置文件中的 AppID 是否正确\n运行: md2wechat config list',
    }],
    [40014, {
      code: 40014,
      message: '不合法的 Access Token',
      hint: 'Access Token 已过期或无效，请重试（系统会自动刷新）',
    }],
    [40029, {
      code: 40029,
      message: 'invalid code（OAuth2.0）',
      hint: '授权码无效或已过期',
    }],
    [40125, {
      code: 40125,
      message: '无效的密钥',
      hint: '请检查配置文件中的 AppSecret 是否正确',
    }],
    [41001, {
      code: 41001,
      message: '缺少 Access Token',
      hint: '请检查微信公众号配置',
    }],
    [41002, {
      code: 41002,
      message: '缺少 AppID',
      hint: '请运行: md2wechat config init',
    }],
    [41003, {
      code: 41003,
      message: '缺少 refresh_token',
      hint: '请重新授权',
    }],
    [42001, {
      code: 42001,
      message: 'Access Token 超时',
      hint: '系统会自动刷新 Access Token，请重试',
    }],
    [42002, {
      code: 42002,
      message: 'refresh_token 超时',
      hint: '请重新授权',
    }],
    [43001, {
      code: 43001,
      message: '需要 GET 请求',
      hint: '请使用 GET 方法调用此接口',
    }],
    [43002, {
      code: 43002,
      message: '需要 POST 请求',
      hint: '请使用 POST 方法调用此接口',
    }],
    [43003, {
      code: 43003,
      message: '需要 HTTPS 请求',
      hint: '请使用 HTTPS 协议',
    }],
    [44001, {
      code: 44001,
      message: '多媒体文件为空',
      hint: '请检查文件是否存在且不为空',
    }],
    [44002, {
      code: 44002,
      message: 'POST 的数据包为空',
      hint: '请检查请求参数',
    }],
    [44003, {
      code: 44003,
      message: '图文消息内容为空',
      hint: '请检查文章内容',
    }],
    [44004, {
      code: 44004,
      message: '文本消息内容为空',
      hint: '请检查文本内容',
    }],
    [45001, {
      code: 45001,
      message: '多媒体文件大小超过限制',
      hint: '图片最大 2 MB，请压缩后重试',
    }],
    [45002, {
      code: 45002,
      message: '消息内容超过限制',
      hint: '文章内容过长，请适当精简',
    }],
    [45003, {
      code: 45003,
      message: '标题字段超过限制（最多 32 字符）',
      hint: '请缩短标题或使用 --title 参数覆盖',
    }],
    [45004, {
      code: 45004,
      message: '描述字段超过限制（最多 128 字符）',
      hint: '请缩短摘要或使用 --digest 参数覆盖',
    }],
    [45005, {
      code: 45005,
      message: '链接字段超过限制',
      hint: '请缩短链接 URL',
    }],
    [45006, {
      code: 45006,
      message: '图片链接字段超过限制',
      hint: '请缩短图片 URL',
    }],
    [45007, {
      code: 45007,
      message: '语音播放时间超过限制',
      hint: '语音最长 60 秒',
    }],
    [45008, {
      code: 45008,
      message: '图文消息超过限制（最多 8 条）',
      hint: '单次最多发送 8 条图文消息',
    }],
    [45009, {
      code: 45009,
      message: '接口调用超过限制',
      hint: 'API 调用次数超过限制，请稍后重试',
    }],
    [45015, {
      code: 45015,
      message: '回复时间超过限制',
      hint: '48 小时内可回复',
    }],
    [45016, {
      code: 45016,
      message: '系统分组，不允许修改',
      hint: '系统分组不可修改',
    }],
    [45017, {
      code: 45017,
      message: '分组名字过长',
      hint: '分组名最多 30 字符',
    }],
    [45018, {
      code: 45018,
      message: '分组数量超过上限',
      hint: '最多 100 个分组',
    }],
    [46001, {
      code: 46001,
      message: '不存在媒体数据',
      hint: '请检查 media_id 是否正确',
    }],
    [46002, {
      code: 46002,
      message: '不存在的菜单版本',
      hint: '请检查菜单版本号',
    }],
    [46003, {
      code: 46003,
      message: '不存在的菜单数据',
      hint: '请检查菜单是否存在',
    }],
    [46004, {
      code: 46004,
      message: '不存在的用户',
      hint: '请检查用户 OpenID',
    }],
    [47001, {
      code: 47001,
      message: '解析 JSON/XML 内容错误',
      hint: '请检查请求参数格式',
    }],
    [48001, {
      code: 48001,
      message: 'API 功能未授权',
      hint: '请检查公众号类型，该功能可能仅对认证公众号开放',
    }],
    [48002, {
      code: 48002,
      message: '粉丝拒收消息',
      hint: '用户已拒收消息',
    }],
    [50001, {
      code: 50001,
      message: '用户未授权该 API',
      hint: '请检查 API 权限设置',
    }],
    [50002, {
      code: 50002,
      message: '用户受限，无法访问该 API',
      hint: '请检查用户状态',
    }],
    
    // IP 白名单相关
    [61004, {
      code: 61004,
      message: 'IP 地址不在白名单中',
      hint: '请登录微信公众平台配置 IP 白名单\n1. 登录 https://mp.weixin.qq.com/\n2. 开发 → 基本配置 → IP 白名单\n3. 添加当前服务器 IP（运行 curl ifconfig.me 查看）',
      docsUrl: 'https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html',
    }],
    
    // 素材相关
    [40007, {
      code: 40007,
      message: '不合法的 media_id',
      hint: '请检查封面图是否已上传到微信素材库\n使用 --cover 参数指定封面图',
    }],
    [40008, {
      code: 40008,
      message: '不合法的消息类型',
      hint: '请检查消息类型',
    }],
    [40009, {
      code: 40009,
      message: '不合法的图片文件大小',
      hint: '图片文件大小不能超过 2 MB',
    }],
    [40011, {
      code: 40011,
      message: '不合法的文件类型',
      hint: '仅支持 JPG / PNG / GIF 格式',
    }],
  ]);

  /**
   * 解析微信 API 错误
   */
  static parseError(response: any): Error {
    const errcode = response.errcode || response.error_code;
    const errmsg = response.errmsg || response.error_message || '未知错误';

    if (!errcode) {
      return new Error(errmsg);
    }

    const errorInfo = this.errorMap.get(errcode);

    if (errorInfo) {
      const error = new Error(`微信 API 错误 [${errcode}]: ${errorInfo.message}`);
      (error as any).hint = errorInfo.hint;
      (error as any).docsUrl = errorInfo.docsUrl;
      return error;
    }

    return new Error(`微信 API 错误 [${errcode}]: ${errmsg}`);
  }

  /**
   * 判断是否为可重试错误
   */
  static isRetryableError(errcode: number): boolean {
    const retryableErrors = [
      -1,    // 系统繁忙
      40014, // 不合法的 Access Token
      42001, // Access Token 超时
      45009, // 接口调用超过限制
    ];
    return retryableErrors.includes(errcode);
  }
}

export default WechatErrorHandler;
