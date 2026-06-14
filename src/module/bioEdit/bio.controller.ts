import { bioAddService } from "./bio.servic.js";
import type { Request, Response } from "express";

const bioAddController = async (req: Request, res: Response) => {
   
        try {
            const userId= req.params.id as string;
        const { bio } = req.body;
        if (userId && bio) {
            const user = await bioAddService(userId, bio);
            return res.status(200).json({ success: true, user, message: "User updated successfully" });
        } else {
            res.status(400).json({ success: false, error: "userId or bio is empty" });
        }
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }    
}

export default bioAddController;