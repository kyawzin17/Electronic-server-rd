import { bioAddService } from "./bio.servic.js";
import type { Request, Response } from "express";

const bioAddController = async (req: Request, res: Response) => {
   
    try {
        const userId= req.params.id as string;
        const { bio } = req.body;
        const user = await bioAddService(userId, bio);
        res.status(200).json(user);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export default bioAddController;