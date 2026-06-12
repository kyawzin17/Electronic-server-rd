import { editServic } from "./edit.servic.js";
import type { Request, Response } from "express";

export const editController= async (req: Request, res: Response) => {

   const user_id= req.params.id;

   if (!user_id) {
    return res.status(404).json("User id is required!")
   }
   const user= req.body;
   if (!user) {
    return res.status(404).json("User data is required!")
   }
   const userData= await editServic(user, user_id.toString());
    
   if (userData) {
    return res.status(200).json(userData);
   }
   return res.status(404).json("User not found!");
}