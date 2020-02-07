const Koa = require('Koa')
const Router = require('Koa-router')
const next = require('next') // 把next作为中间件使用
const session = require('koa-session')
const Redis = require('ioredis')
const KoaBody = require('koa-body')
const atob = require('atob')

const auth = require('./server/auth')
const api = require('./server/api')

const RedisSessionStore = require('./server/session-store')

const dev = process.env.NODE_ENV !== 'production'
const app = next({dev}) // 初始化nextjs,传入是否是开发环境，比如开发时不需要hot-middle-repalce功能

const handle = app.getRequestHandler() // handle处理Http请求的响应

// 创建redis client
const redis = new Redis()

// 设置nodejs全局增加一个atob方法
global.atob = atob

// 等到pages下所有的页面都编译完成才可以真正启动服务来响应请求
app.prepare().then(() => {
    const server = new Koa()
    const router = new Router()

    server.keys = ['Money']

    server.use(KoaBody())
    const SESSION_CONFIG = {
        key: 'jid',
        store: new RedisSessionStore(redis)
    }
    server.use(session(SESSION_CONFIG, server))

    // 配置处理github OAuth的登录
    auth(server)
    api(server)

    router.get('api/user/info', async ctx => {
        const user = ctx.session.userInfo
        if (!user) {
            ctx.status = 401
            ctx.body = 'Need Login'
        } else {
            ctx.body = user
            ctx.set('Content-Type', 'application/json')
        }
    })
    
    server.use(router.routes())
    server.use(async (ctx, next) => {
        ctx.req.session = ctx.session
        await handle(ctx.req, ctx.res)
        ctx.respond = false
    })
    server.use(async (ctx, next) => {
        ctx.res.statusCode = 200
        await next()
    })
    server.listen(3000, () => {
        console.log('koa server listening on 3000')
    })
})