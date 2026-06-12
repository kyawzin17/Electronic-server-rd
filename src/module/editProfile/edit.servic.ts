import { prisma } from "../../lib/prisma.js"

export const editServic= async (user: {email: string, name: string, hobby: string, gender: string, bio: string}, user_id: string) => {

    const userEmail= user.email;

    if (!userEmail) {
        return "This account is not find!";
    }
    try {
        const userData= await prisma.user.update({
            where: {
                id: user_id
            }, 
            data: {
                name: user.name,
                hobby: user.hobby,
                gender: user.gender,
                bio: user.bio,
            }
        })
    return userData;
    } catch (error) {
        return error;
    }

}