// 小米 MiMo 官方新闻(mimo.mi.com/docs 侧边栏即完整新闻列表)
// 页面无发布日期,published 留空(按抓取顺序排列)
// 配置: limit (number, 默认 10) — 抓取最新条数
function collect(source) {
  var limit = 10;
  if (source.config && source.config.limit) {
    limit = parseInt(source.config.limit, 10) || 10;
  }
  var base = "https://mimo.mi.com";
  // 任一 news 页的侧边栏都列出全部新闻: <a href="/docs/zh-CN/news/latest/<slug>"><span>标题</span></a>
  var html = http.get(base + "/docs/zh-CN/news/latest/v2-6");
  var re = /href="(\/docs\/zh-CN\/news\/latest\/[a-zA-Z0-9.\-]+)"[^>]*><span[^>]*>([^<]+)<\/span>/g;
  var seen = {};
  var rows = [];
  var m;
  while ((m = re.exec(html)) !== null) {
    var path = m[1];
    var title = m[2].replace(/^\s+|\s+$/g, "");
    if (seen[path] || !title) continue;
    seen[path] = true;
    rows.push({ path: path, title: title });
  }
  var items = [];
  for (var i = 0; i < rows.length && i < limit; i++) {
    var r = rows[i];
    var content = "";
    try {
      var page = http.get(base + r.path);
      // 正文容器: <div class="mdxContent"> ... </main>
      var start = page.indexOf('<div class="mdxContent">');
      if (start >= 0) {
        var end = page.indexOf("</main>", start);
        content = page.slice(start + 24, end > 0 ? end : undefined);
      }
    } catch (e) { /* 正文抓取失败时保留标题 */ }
    items.push({
      guid: "mimo-" + r.path.split("/").pop(),
      title: r.title,
      link: base + r.path,
      author: "Xiaomi MiMo",
      content: content,
      published: "",
    });
  }
  return items;
}
