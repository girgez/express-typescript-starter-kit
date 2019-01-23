import express from "express";
import compression from "compression";  // compresses requests
import bodyParser from "body-parser";
import lusca from "lusca";
import mongoose from "mongoose";
import passport from "passport";
import expressValidator from "express-validator";
import bluebird from "bluebird";
import { default as extendResponse }  from "./extensions/response";

// Load secret and logger
import { MONGODB_URI, APP_PORT } from "./util/secrets";
import logger from "./util/logger";

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
    logger.error("MongoDB connection error. Please make sure MongoDB is running. " + err);
    // process.exit();
});

// Express configuration
app.set("port", APP_PORT);
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