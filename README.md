# Miox Server Render (koa-vuejs)

它是一套miox服务端渲染的中间件集合。

- 环境 `koa@2x`
- 框架 `vuejs@2x`

# Usage

```bash
npm install --save-dev miox-koa-vue2x-server-render
```

# Run it

```javascript
import Koa from 'koa';
import ServerRenderer from 'miox-koa-vue2x-server-render';
const app = new Koa();
const service = new ServerRenderer(app, {
    entry: {
        dir: 'src',
        filename: 'index.js'
    },
    buildPrefix: 'build',
    lru: {
        max: 1000,
        maxAge: 1000 * 60 * 15
    },
    static: {
        maxAge: 31536000,
        gzip: true,
        dynamic: true,
        ...args
    },
    clientCallback(options) {
        // ...
    },
    serverCallback(options) {
        // ...
    }
});

// 桥接程序
service.connect();

app.listen(3000);
```

# 参数说明

```javascript
/**
 * 配置
 * @param app
 * @param options
 *  - entry: <Object> 源码地址，基于process.cwd()的目录，前缀不带任何符号。
 *      - dir: 目录地址
 *      - filename: 文件名
 *  - buildPrefix: <String> 编译后文件地址，基于process.cwd()的目录，前缀不带任何符号。
 *  - lru: <Object> Lru-Cache 配置。
 *  - static: <Object> 静态资源配置`koa-static-cache`
 *  - clientCallback: <Function> 修改Client端配置
 *  - serverCallback: <Function> 修改Server端配置
 */
```