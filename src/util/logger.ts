import winston, { format } from "winston";

const myFormat = format.printf(info => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
});

const logger = winston.createLogger({
    level: "debug",
    transports: [
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "combined.log"})
    ],
    format: winston.format.combine(winston.format.timestamp(), myFormat)
});

if (process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console());
}

export default logger;