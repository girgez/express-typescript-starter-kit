import passport from "passport";
import { IVerifyOptions } from "passport-local";
import { default as User, UserModel } from "../models/User";
import "../config/passport";
import { Request, Response, NextFunction } from "express";
import { awaitExpression } from "babel-types";

/**
 * GET /login
 * Login page.
 */
export let getLogin = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("account/login", {
        title: "Login"
    });
};

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
        req.flash("errors", errors);
        return res.redirect("/login");
    }

    passport.authenticate("local", (err: Error, user: UserModel, info: IVerifyOptions) => {
        if (err) { return next(err); }

        if (!user) {
            req.flash("errors", { msg: info.message });
            return res.redirect("/login");
    }

        req.logIn(user, (err) => {
            if (err) { return next(err); }

            req.flash("success", { msg: "Success! You are logged in." });
            res.redirect(req.session.returnTo || "/");
        });
    })(req, res, next);
};

/**
 * GET /register
 * Register page.
 */
export let getRegister = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("account/register", {
        title: "Create Account"
    });
};

/**
 * GET /logout
 * Log out.
 */
export let logout = (req: Request, res: Response) => {
    req.logout();
    res.redirect("/");
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
        req.flash("errors", errors);
        return res.redirect("/register");
    }

    const user = new User({
        email: req.body.email,
        password: req.body.password
    });

    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            req.flash("errors", { msg: "Account with that email address already exists." });
            return res.redirect("/register");
        }
    } catch (err) {
        return next(err);
    }

    try {
        await user.save();
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }

            return res.redirect("/");
        });
    } catch (err) {
        return next(err);
    }
};