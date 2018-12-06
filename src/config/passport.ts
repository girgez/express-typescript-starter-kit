import passport from "passport";
import passportLocal, { IVerifyOptions } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import _ from "lodash";

import { default as User, UserModel } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../util/secrets";

const LocalStrategy = passportLocal.Strategy;

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email.toLowerCase() }, (err, user: any) => {
        if (err) { return done(err); }
        if (!user) {
            return done(undefined, false, { message: `Email ${email} not found.` });
        }
        user.comparePassword(password, (err: Error, isMatch: boolean) => {
            if (err) { return done(err); }
            if (isMatch) {
                return done(undefined, user);
            }
            return done(undefined, false, { message: "Invalid email or password." });
        });
    });
}));


/**
 * Authenticate by jwt
 */
const opt = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
    secretOrKey: JWT_SECRET,
    ignoreExpiration: false
};

passport.use(new JwtStrategy(opt, function (payload, done) {
    User.findOne({ _id: payload.id }, (err, user: any) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(undefined, false, { message: `User not found.` });
        }
        if (user) {
            return done(undefined, user);
        }
    });
}));

/**
 * Login Required middleware.
 */
export let isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("jwt", (err: Error, user: UserModel, info: IVerifyOptions) => {
        if (err) {
            return res.status(500).errorJson({
                message: err.message
            });
        }
        if (!user) {
            return res.status(401).errorJson({
                message: info.message
            });
        }

        req.user = user;
        return next();
    })(req, res, next);
};
