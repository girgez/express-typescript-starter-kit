import bcrypt from "bcrypt-nodejs";
import crypto from "crypto";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../util/secrets";

export type UserModel = mongoose.Document & {
    email: string,
    password: string,
    passwordResetToken: string,
    passwordResetExpires: Date,

    profile: {
        name: string,
        gender: string,
        location: string,
        website: string,
        picture: string
    },

    comparePassword: comparePasswordFunction,
    gravatar: (size: number) => string,

    generateJwtToken: generateJwtTokenFunction,
    getPublicProfile: getPublicProfileFunction
};

type comparePasswordFunction = (candidatePassword: string, cb: (err: any, isMatch: any) => {}) => void;
type generateJwtTokenFunction = () => string;
type getPublicProfileFunction = () => any;

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,

    profile: {
        name: String,
        gender: String,
        location: String,
        website: String,
        picture: String
    }
}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre("save", function save(next: any) {
    const user = this;
    if (!user.isModified("password")) { return next(); }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) { return next(err); }
        bcrypt.hash(user.password, salt, undefined, (err: mongoose.Error, hash) => {
            if (err) { return next(err); }
            user.password = hash;
            next();
        });
    });
});

const comparePassword: comparePasswordFunction = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
        cb(err, isMatch);
    });
};

const generateJwtToken: generateJwtTokenFunction = function () {
    return jwt.sign({ id: this._id }, JWT_SECRET, { expiresIn: "30d" });
};

const getPublicProfile: getPublicProfileFunction = function () {
    return {
        email: this.email,
        avatar: this.profile.picture || this.gravatar,
        name: this.profile.name,
        gender: this.profile.gender,
        website: this.profile.website
    };
};

userSchema.methods.comparePassword = comparePassword;
userSchema.methods.generateJwtToken = generateJwtToken;
userSchema.methods.getPublicProfile = getPublicProfile;

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function (size: number) {
    if (!size) {
        size = 200;
    }
    if (!this.email) {
        return `https://gravatar.com/avatar/?s=${size}&d=retro`;
    }
    const md5 = crypto.createHash("md5").update(this.email).digest("hex");
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model<UserModel>("User", userSchema);
export default User;
