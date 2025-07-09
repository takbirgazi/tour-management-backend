import dotenv from "dotenv";

dotenv.config();

interface EnvVariable {
    PORT: string,
    DB_URL: string,
    NODE_ENV: "development" | "production",
}
const loadEnv = (): EnvVariable => {
    const requireVar: string[] = ["PORT", "DB_URL", "NODE_ENV"];

    requireVar.forEach(key => {
        if (!process.env[key]) {
            throw Error(`Missing Environment Variable ${key}`);
        }
    });
    
    return {
        PORT: process.env.PORT as string,
        DB_URL: process.env.DB_URL as string,
        NODE_ENV: process.env.NODE_ENV as "development" | "production",
    }
}
export const envVars = loadEnv();