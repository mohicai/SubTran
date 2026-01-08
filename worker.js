export default {
  async fetch(request, env) {
    const target = await env.SKY.get("sky.txt");
    if (!target) {
      return new Response("sky.txt 未找到", { status: 500 });
    }
    
    // 白名单校验
    const url = new URL(request.url);
    const target1 = url.searchParams.get("url");
    const allowed = "https://skysub1.fawnnode.xyz/link/ZEILbq2AX1LrAzgh?clash=1";
    if (target1 !== allowed) {
      return new Response("禁止访问：订阅链接不在白名单", { status: 403 });
    }
    
    // 拉取原始订阅内容
    const resp = await fetch(target);
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