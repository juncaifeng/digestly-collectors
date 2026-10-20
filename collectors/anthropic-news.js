// Anthropic 官方新闻(anthropic.com/news 的 PublicationList 即完整列表)
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

// "Oct 18, 2026" -> ISO 时间(源站日期无时区,按 UTC 00:00 合成)
function parseDate(d) {
  var months = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
  var m = String(d).match(/^([A-Za-z]{3})[a-z]*\s+(\d{1,2}),\s+(\d{4})$/);
  if (!m || !months[m[1]]) return null;
  var mm = months[m[1]];
  return m[3] + "-" + (mm < 10 ? "0" + mm : mm) + "-" + (m[2].length < 2 ? "0" + m[2] : m[2]) + "T00:00:00Z";
}

function collect(source) {
  var limit = 10;
  if (source.config && source.config.limit) {
    limit = parseInt(source.config.limit, 10) || 10;
  }
  var base = "https://www.anthropic.com";
  var html = http.get(base + "/news");
  // 列表条目: <a href="/news/<slug>"> ... <time>日期</time><span>栏目</span></div><span>标题</span>
  var re = /<li><a href="(\/news\/[a-zA-Z0-9-]+)"[\s\S]*?<time[^>]*>([^<]+)<\/time>[\s\S]*?<\/div><span[^>]*>([^<]+)<\/span><\/a>/g;
  var seen = {};
  var rows = [];
  var m;
  while ((m = re.exec(html)) !== null) {
    var path = m[1];
    if (seen[path]) continue;
    var title = decodeEntities(m[3].replace(/^\s+|\s+$/g, ""));
    if (!title) continue;
    seen[path] = true;
    rows.push({ path: path, title: title, published: parseDate(m[2]) });
  }
  var items = [];
  for (var i = 0; i < rows.length && i < limit; i++) {
    var r = rows[i];
    var content = "";
    try {
      var page = http.get(base + r.path);
      var cm = page.match(/<main[^>]*>([\s\S]*?)<\/main>/);
      if (cm) content = cm[1];
    } catch (e) { /* 正文抓取失败时保留标题 */ }
    items.push({
      guid: "anthropic-" + r.path.split("/").pop(),
      title: r.title,
      link: base + r.path,
      author: "Anthropic",
      content: content,
      published: r.published,
    });
  }
  return items;
}
