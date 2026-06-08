// Postgres Database မှာ ‌Admin ပေါင်းထည့်ဖို့ ==> Add Admin User (Kyaw Zin Win)
//npx tsx src/script.ts
import { prisma } from "./lib/prisma.js";
import type { Role } from "./lib/prisma.js";
import bcrypt from "bcrypt";

const addAdmin = async (name: string, email: string, password: string, role: Role) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            name: name,
            email: email,
            password: hashedPassword,
            role: role
        },
    });
    console.log("Admin user created successfully.");
}

const main = async () => {
    try {
    await addAdmin("Kyaw Zin Win", "kyawzinwin23k@gmail.com", "176622osk", "ADMIN");
    } catch (error) {
        console.error("Error creating admin user:", error);
    }
}

main();