# Miox Server Render (koa+vuejs@2x+ssr)

它是一套miox服务端渲染的中间件集合。

- 环境 `koa@2x`
- 框架 `vuejs@2x`

# Usage

```bash
npm install --save-dev miox-koa-vue2x-server-render
```

# Run it

```javascript
const ServerRender = require('miox-koa-vue2x-server-render');
const config = require('./config');
const base = require('./ssr');
const server = new ServerRender(config);
const app = new Koa();
server.use(base);
server.connect(app);
app.listen(3000, () => console.log('start server at http://127.0.0.1:3000'));
```

# 参数说明

**configs:**

- `cwd` [String] 基址
- `whitelist` [Array] 白名单列表。将使用源码编译的正则表达式写入。
- `hot` [Boolean] 默认`false`。启动热更新。
- `static` [Json] 静态资源缓存配置 { maxAge[Number:31536000], gzip[Boolean:false], dynamic[Boolean:true],... } # [https://www.npmjs.com/package/koa-static-cache](https://www.npmjs.com/package/koa-static-cache)
- `cache` [Boolean] 是否使用缓存？默认`false`
- `title` [String] 默认标题头
- `app` [String] 入口文件绝对地址
- `build` [String] 打包所在文件夹绝对地址
- `prefix` [String] URL前缀

# Events

## Dev 

1. `DEV:HMR:BEFORE`
1. `DEV:SERVER:BEFORE`
1. `DEV:SERVER:INJECT`
1. `CREATE:SERVER:BEFORE`

## Pro

1. `PRO:STATIC:BEFORE`
1. `CREATE:SERVER:BEFORE`