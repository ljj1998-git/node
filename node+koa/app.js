const koa = require('koa');
const Router = require('koa-router');
const mongoose = require('mongoose');
const { mongoURL } = require('./config/keys')
const bodyParser = require('koa-bodyparser')
const passport = require('koa-passport')

//实例化koa对象
const app = new koa();
const router = new Router();

app.use(bodyParser());

app.use(passport.initialize())
app.use(passport.session())

//回调到config中
require('./config/passport')(passport)

//引入users.js
const users = require("./routes/api/users");


//路由
router.get("/", async ctx => {
    ctx.body = { msg: "hellow worlds" }
})

//连接数据库
mongoose.connect(mongoURL, { useUnifiedTopology: true, useNewUrlParser: true }).then(() => {
    console.log("数据库连接成功");
}).catch(err => {
    console.log("失败:" + err);
})

//配置路由地址
router.use("/api/users", users)

//配置路由
app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log("连接为:" + port);
})