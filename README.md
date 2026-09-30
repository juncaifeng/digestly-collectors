# digestly-collectors

digestly 的官方订阅源市场。每个 `.js` 是一个采集器,在应用内"市场"页一键安装即可订阅。

## 脚本规范

- 必须定义 `collect(source)`,返回文章数组
- `source`: `{ url: string, config: Record<string,string> }`,config 来自 manifest 的 `config_schema` 实例化
- 宿主注入 `http.get(url) -> string`(同步),无文件系统/进程权限
- 返回字段: `guid`(可空,缺省用 link)、`title`、`link`、`author`、`content`(HTML)、`published`(RFC3339,可空)
- 兼容性: goja 运行时,写 ES5 语法最稳(`var`、不用箭头函数/Promise)

```js
function collect(source) {
  var html = http.get(source.url);
  return [{ guid: "x-1", title: "...", link: "...", author: "", content: html, published: "" }];
}
```

## 收录流程

1. Fork 后在 `collectors/` 加脚本,并在 `manifest.json` 注册(含 `script_version` 递增)
2. PR 说明数据源与更新频率,review 合入即上架

## 安全说明

脚本拥有网络访问能力(可发起任意 HTTP 请求)。官方仓库脚本经过 review;
从其他来源手动导入脚本前请先阅读源码。
