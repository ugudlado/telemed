import express from "express";
import JwtUtility from "../utils/JwtUtility";

export function isAuthenticated(req: express.Request, res: express.Response, next: any) {
    const token = req.headers.authorization;
    const service = new JwtUtility();
    const a = service.isTokenValid(token as string);
    if (a) {
        return next();
    } else {
        res.status(403).send("Unauthorized request");
    }
}
