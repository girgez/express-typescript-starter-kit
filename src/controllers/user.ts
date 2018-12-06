import passport from "passport";
import { IVerifyOptions } from "passport-local";
import { default as User, UserModel } from "../models/User";
import "../config/passport";
import { Request, Response, NextFunction } from "express";

/**
 * POST /login
 * Sign in using email and password
 */
export let postLogin = (req: Request, res: Response, next: NextFunction) => {
    req.checkBody("email", "Email is not valid").isEmail();
    req.checkBody("password", "Password cannot be blank").notEmpty();
    req.sanitizeBody("email").normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        return res.status(400).errorJson({
            message: "Invalid params."
        });
    }

    passport.authenticate("local", (err: Error, user: UserModel, info: IVerifyOptions) => {
        if (err) { return next(err); }

        if (!user) {
            return res.status(401).errorJson({
                message: info.message
            });
        }

        return res.status(200).dataJson({
            token: user.generateJwtToken()
        });
    })(req, res, next);
};

/**
 * POST /register
 * Create a new local account.
 */
export let postRegister = async (req: Request, res: Response, next: NextFunction) => {
    req.checkBody("email", "Email is not valid").isEmail();
    req.checkBody("password", "Password must be at least 4 characters long").len({ min: 4 });
    req.checkBody("confirmPassword", "Passwords do not match").equals(req.body.password);
    req.sanitize("email").normalizeEmail({ gmail_remove_dots: true });

    const errors = req.validationErrors();

    if (errors) {
        return res.status(400).errorJson({
            message: "Invalid params."
        });
    }

    const user = new User({
        email: req.body.email,
        password: req.body.password
    });

    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(403).errorJson({
                message: "Account with that email address already exists."
            });
        }
    } catch (err) {
        return next(err);
    }

    try {
        await user.save();
        return res.status(200).dataJson({
            token: user.generateJwtToken()
        });
    } catch (err) {
        return next(err);
    }
};

export let getProfile = async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).dataJson(req.user.getPublicProfile());
};