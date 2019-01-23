import errorHandler from "errorhandler";
import app from "./app";

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());
/**
 * Start Express server.
 */
export const server = app.listen(app.get("port"), () => {
    console.log(
        "  App is running at http://localhost:%d in %s mode at %s",
        app.get("port"),
        app.get("env"),
        new Date()
    );
    console.log("  Press CTRL-C to stop\n");
});