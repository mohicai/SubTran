export default {
  async fetch(request, env) {
    const target = await env.SKY.get("sky.txt");
    if (!target) {
      await sendPush(env, "sky.txt 未找到");
      return new Response("sky.txt 未找到", { status: 500 });
    }
    
    // 白名单校验
    const url = new URL(request.url);
    const target1 = url.searchParams.get("url");
    const allowed = "https://skysub1.fawnnode.xyz/link/ZEILbq2AX1LrAzgh?clash=1";
    if (target1 !== allowed) {
      await sendPush(env, `非法访问：${target1}`);
      return new Response("禁止访问：订阅链接不在白名单", { status: 403 });
    }
    
    // 拉取原始订阅内容
    let resp;
    try {
      resp = await fetch(target, { timeout: 8000 });
    } catch (err) {
      await sendPush(env, `订阅链接无法访问：${target}\n错误：${err.message}`);
      return new Response("无法访问订阅链接", { status: 500 });
    }
    
    if (!resp.ok) {
      await sendPush(env, `订阅链接返回异常状态码：${resp.status}`);
      return new Response("订阅源异常", { status: 500 });
    }
    
    let text = await resp.text();
    
    // 替换 Host
    text = text.replace(/(ws-headers:\s*\n\s*Host:\s*).*/g,
      `$1baiducdncmn2.inter.iqiyi.com`);
    text = text.replace(/(headers:\s*\{\s*Host:\s*).+?\}/g,
      `$1baiducdncmn2.inter.iqiyi.com}`);
    
    return new Response(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}

// ----------------------
// PushPlus 推送函数
// ----------------------
async function sendPush(env, message) {
  const token = env.PUSHPLUS_TOKEN;
  
  const body = JSON.stringify({
    token,
    title: "订阅访问失败通知",
    content: message,
    template: "txt"
  });
  
  await fetch("https://www.pushplus.plus/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  });
}