// ============================================
// 微信小程序登录工具 — code2session
// ============================================
// 微信小程序登录流程：
//   1. 小程序端调用 wx.login() 获得临时 code
//   2. 小程序把 code 发给我们的后端
//   3. 后端用 code + appid + secret 向微信服务器换取 openid
//   4. openid 是微信用户的唯一标识，我们用它来识别用户
//
// 微信官方文档：
//   https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/code2Session.html

const axios = require('axios');

// 微信 jscode2session 接口地址
const WECHAT_API_URL = 'https://api.weixin.qq.com/sns/jscode2session';

/**
 * 用小程序 code 换取微信用户的 openid
 * @param {string} code - 小程序端 wx.login() 返回的临时登录凭证
 * @returns {Promise<{openid: string, session_key: string}>}
 * @throws {Error} 微信接口返回错误时抛出异常
 */
async function code2session(code) {
  try {
    // 向微信服务器发起 GET 请求
    const { data } = await axios.get(WECHAT_API_URL, {
      params: {
        appid: process.env.WX_APPID,       // 小程序的 appid，在 .env 中配置
        secret: process.env.WX_SECRET,     // 小程序的密钥，在 .env 中配置（绝不能暴露给前端！）
        js_code: code,                     // 小程序传过来的临时 code
        grant_type: 'authorization_code',  // 固定值
      },
      timeout: 8000,
    });

    // 微信返回错误时，data 中会包含 errcode 字段
    if (data.errcode) {
      const err = new Error(`微信登录失败: ${data.errmsg} (错误码: ${data.errcode})`);
      err.statusCode = 502;
      throw err;
    }

    // 成功时返回 { openid, session_key }
    // 注意：session_key 不要返回给前端，也不要存数据库，它是敏感信息
    return data;
  } catch (err) {
    const wrapped = new Error(`微信接口调用失败: ${err.message}`);
    wrapped.statusCode = err.statusCode || 502;
    throw wrapped;
  }
}

module.exports = { code2session };
