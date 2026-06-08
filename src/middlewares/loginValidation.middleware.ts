import type { NextFunction, Request, Response } from "express";

const loginValidationMiddleware = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
                schema.parse(req.body);
                next();
        } catch (error: any) {
            return res.status(400).json({ 
             success: false,
             error: error.errors });
         }
    }
}

export default loginValidationMiddleware;