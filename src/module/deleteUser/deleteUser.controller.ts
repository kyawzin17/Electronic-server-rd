import { prisma } from "../../lib/prisma.js"
import type { Request, Response } from "express"

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params
    await prisma.user.delete({
        where: {
            id: id as string
        }
    })
    res.status(200).json({
        message: "User deleted successfully"
    })
}