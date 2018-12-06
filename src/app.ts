import express from "express";
import compression from "compression";  // compresses requests
import bodyParser from "body-parser";
import lusca from "lusca";
import dotenv from "dotenv";
import mongoose from "mongoose";
import passport from "passport";
import expressValidator from "express-validator";
import bluebird from "bluebird";
import { MONGODB_URI } from "./util/secrets";
import { default as extendResponse }  from "./extensions/response";

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config();

// Controllers (route handlers)
import * as passportConfig from "./config/passport";
import * as userController from "./controllers/user";

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
(<any>mongoose).Promise = bluebird;
// @ts-ignore
mongoose.connect(mongoUrl, { useCreateIndex: true, useNewUrlParser: true }).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch((err: any) => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    // process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(passport.initialize());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use(extendResponse);

/**
 * Primary app routes.
 */
app.post("/login", userController.postLogin);
app.post("/register", userController.postRegister);
app.get("/profile", passportConfig.isAuthenticated, userController.getProfile);

export default app;