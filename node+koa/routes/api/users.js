const Router = require('koa-router');
const router = new Router();
const User = require('../../models/User')
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar')
const jwt = require('jsonwebtoken')
const { secretOrKey } = require('../../config/keys')
const passport = require('koa-passport')

const validateRegisterInput = require('../../validation/register')

/**
 * @route GET api/users/test
 * @desc 测试接口地址
 * @access 接口是公开的
 */
router.get("/test", async ctx => {
    ctx.status = 200;
    ctx.body = { msg: "666" }
})

/**
 * @route POST api/users/register
 * @desc 注册接口地址
 * @access 接口是公开的
 */
router.post("/register", async ctx => {
    const { errors, isValid } = validateRegisterInput(ctx.request.body)
    if (!isValid) {
        ctx.status = 400;
        ctx.body = errors;
        return
    }

    const findResult = await User.find({ email: ctx.request.body.email });
    if (findResult.length > 0) {
        ctx.status = 500;
        ctx.body = {
            email: "邮箱已被占用"
        }
    } else {
        const avatar = gravatar.url(ctx.request.body.email, { s: '200', r: 'pg', d: 'mm' })
        const newUser = new User({
            name: ctx.request.body.name,
            email: ctx.request.body.email,
            avatar,
            password: ctx.request.body.password
        });

        await new Promise((resolve, reject) => {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) reject(err)
                    newUser.password = hash
                    resolve()
                })
            })
        })

        await newUser.save()
            .then(user => {
                ctx.body = user;
            })
            .catch(() => {
                console.log(err);
            });
        ctx.body = newUser;
    }
})

/**
 * @route POST api/users/register
 * @desc 登录接口地址
 * @access 接口是公开的
 */
router.post("/login", async ctx => {
    //查询
    const findResult = await User.find({ email: ctx.request.body.email });
    const password = ctx.request.body.password
    if (findResult.length === 0) {
        ctx.status = 404;
        ctx.body = { email: '用户不存在' };
    } else {
        let result = await bcrypt.compareSync(password, findResult[0].password);
        if (result) {
            //生成token
            const payload = { id: findResult[0].id, name: findResult[0].name, avatat: findResult[0].avatar };
            const token = jwt.sign(payload, secretOrKey, { expiresIn: 3600 });

            ctx.status = 200;
            ctx.body = { success: true, token: "Bearer " + token }
        } else {
            ctx.status = 400;
            ctx.body = { password: '密码错误' }
        }
    }
})

/**
 * @route GET api/users/current
 * @desc 用户信息接口地址
 * @access 接口是私密的
 */
router.get("/current", passport.authenticate('jwt', { session: false }), async ctx => {
    ctx.body = {
        id: ctx.state.user.id,
        name: ctx.state.user.name,
        email: ctx.state.user.email,
        avatar: ctx.state.user.avatar,
    }
})

module.exports = router.routes();