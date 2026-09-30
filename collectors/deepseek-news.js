// DeepSeek 官方 API 更新日志(api-docs.deepseek.com 侧边栏即完整新闻列表)
// 配置: limit (number, 默认 10) — 抓取最新条数
function collect(source) {
  var limit = 10;
  if (source.config && source.config.limit) {
    limit = parseInt(source.config.limit, 10) || 10;
  }
  var base = "https://api-docs.deepseek.com";
  // 任一 news 页的侧边栏(menu__link)都列出全部新闻: "标题 YYYY/MM/DD"
  var html = http.get(base + "/news/news260910");
  var re = /href="(\/news\/news[0-9a-z]+)"[^>]*>([^<]+?)<\/a>/g;
  var seen = {};
  var rows = [];
  var m;
  while ((m = re.exec(html)) !== null) {
    var path = m[1];
    var text = m[2].replace(/^\s+|\s+$/g, "");
    if (seen[path]) continue;
    // 侧边栏条目形如 "标题 YYYY/MM/DD";语言切换等无日期链接直接跳过
    var dm = text.match(/^(.*)\s+(\d{4})\/(\d{2})\/(\d{2})$/);
    if (!dm) continue;
    seen[path] = true;
    rows.push({
      path: path,
      title: dm[1].replace(/^\s+|\s+$/g, ""),
      published: dm[2] + "-" + dm[3] + "-" + dm[4] + "T00:00:00Z",
    });
  }
  var items = [];
  for (var i = 0; i < rows.length && i < limit; i++) {
    var r = rows[i];
    var content = "";
    try {
      var page = http.get(base + r.path);
      var cm = page.match(/<article[^>]*>([\s\S]*?)<\/article>/);
      if (cm) content = cm[1];
    } catch (e) { /* 正文抓取失败时保留标题 */ }
    items.push({
      guid: "deepseek-" + r.path.split("/").pop(),
      title: r.title,
      link: base + r.path,
      author: "DeepSeek",
      content: content,
      published: r.published,
    });
  }
  return items;
}
