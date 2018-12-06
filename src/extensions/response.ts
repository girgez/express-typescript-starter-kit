import { Request, Response, NextFunction } from "express";

declare global {
    namespace Express {
        interface Response {
            errorJson: (error: Error) => Response;
            dataJson: (data: any) => Response;
            noData: () => Response;
        }
    }
}

export type Error = {
    code?: number,
    message?: string,
    userMessage?: string
};

const response = (req: Request, res: Response, next: NextFunction) => {
    res.errorJson = (error: Error): Response => {
        res.json({
            timestamp: (new Date).getTime(),
            error: error
        });
        return res;
    };

    res.dataJson = (data: any): Response => {
        res.json({
            timestamp: (new Date).getTime(),
            data: data
        });
        return res;
    };

    res.noData = (): Response => {
        res.json({
            timestamp: (new Date).getTime()
        });

        return res;
    };

    next();
};

export default response;