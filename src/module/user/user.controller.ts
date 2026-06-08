import { prisma } from "../../lib/prisma.js";
import type { Request, Response } from "express";

export const getUser = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    res.json(users);
}