const JwtStrategy = require('passport-jwt').Strategy,
ExtractJwt = require('passport-jwt').ExtractJwt;
const { secretOrKey } = require('../config/keys')
const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = secretOrKey;
const User = require('../models/User')

module.exports = passport => {
    passport.use(new JwtStrategy(opts, async function (jwt_payload, done) {
        console.log(jwt_payload);
        const user = await User.findById(jwt_payload.id);
        if (user) {
            return done(null, user)
        } else {
            return done(null, false)
        }
    }));
}