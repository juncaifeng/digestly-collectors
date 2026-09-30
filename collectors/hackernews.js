// Hacker News 首页 Top stories(官方 API,稳定)
// 配置: limit (number, 默认 20) — 抓取条数
function collect(source) {
  var limit = 20;
  if (source.config && source.config.limit) {
    limit = parseInt(source.config.limit, 10) || 20;
  }
  var ids = JSON.parse(http.get("https://hacker-news.firebaseio.com/v0/topstories.json"));
  var items = [];
  for (var i = 0; i < ids.length && i < limit; i++) {
    var s = JSON.parse(http.get("https://hacker-news.firebaseio.com/v0/item/" + ids[i] + ".json"));
    if (!s || !s.title) continue;
    items.push({
      guid: "hn-" + s.id,
      title: s.title,
      link: s.url || "https://news.ycombinator.com/item?id=" + s.id,
      author: s.by || "",
      content: (s.text || "") + "<p>Score: " + (s.score || 0) + "</p>",
      published: new Date((s.time || 0) * 1000).toISOString(),
    });
  }
  return items;
}
