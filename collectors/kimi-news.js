// Kimi 官方新闻(kimi.com/news 卡片列表)
// 配置: limit (number, 默认 10) — 抓取最新条数
function decodeEntities(t) {
  return String(t)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, function (_, h) { return String.fromCharCode(parseInt(h, 16)); })
    .replace(/&#(\d+);/g, function (_, n) { return String.fromCharCode(parseInt(n, 10)); });
}

function collect(source) {
  var limit = 10;
  if (source.config && source.config.limit) {
    limit = parseInt(source.config.limit, 10) || 10;
  }
  var base = "https://www.kimi.com";
  var html = http.get(base + "/news/");
  // 卡片: <a href="/news/<slug>" aria-label="标题"> ... <p class="card-desc">摘要</p> ... <span>YYYY-MM-DD</span>
  var re = /<a href="(\/news\/[a-zA-Z0-9-]+)" aria-label="([^"]*)"[\s\S]{0,3000}?class="card-desc[^"]*">([^<]*)<\/p>[\s\S]{0,600}?<span>(\d{4}-\d{2}-\d{2})<\/span>/g;
  var seen = {};
  var rows = [];
  var m;
  while ((m = re.exec(html)) !== null) {
    var path = m[1];
    if (seen[path]) continue;
    var title = decodeEntities(m[2].replace(/^\s+|\s+$/g, ""));
    if (!title) continue;
    seen[path] = true;
    rows.push({
      path: path,
      title: title,
      desc: decodeEntities(m[3].replace(/^\s+|\s+$/g, "")),
      published: m[4] + "T00:00:00Z",
    });
  }
  var items = [];
  for (var i = 0; i < rows.length && i < limit; i++) {
    var r = rows[i];
    var content = r.desc;
    try {
      var page = http.get(base + r.path);
      var cm = page.match(/<main[^>]*>([\s\S]*?)<\/main>/);
      if (cm) content = cm[1];
    } catch (e) { /* 正文抓取失败时用摘要兜底 */ }
    items.push({
      guid: "kimi-" + r.path.split("/").pop(),
      title: r.title,
      link: base + r.path,
      author: "Kimi",
      content: content,
      published: r.published,
    });
  }
  return items;
}
