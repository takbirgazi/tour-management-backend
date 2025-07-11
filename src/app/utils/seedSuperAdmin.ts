/* eslint-disable no-console */
import { User } from "../modules/users/user.model"
import { envVars } from '../config/env';
import bcryptjs from "bcryptjs";
import { IAuthProvider, IUser, Role } from "../modules/users/user.interface";

export const seedSuperAdmin = async () => {
    try {
        const isExistSuperAdmin = await User.findOne({ email: envVars.SUPER_ADMIN_EMAIL });
        if (isExistSuperAdmin) {
            console.log("Super Admin has already created!");
            return;
        }

        const hashedPassword = await bcryptjs.hash(envVars.SUPER_ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUND));
        const authProvider: IAuthProvider = {
            provider: "credential",
            providerId: envVars.SUPER_ADMIN_EMAIL
        };
        const payload: IUser = {
            name: "Super Admin",
            email: envVars.SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            auths: [authProvider],
            role: Role.SUPER_ADMIN,
            isVerified: true
        }

        const superAdmin = await User.create(payload);
        console.log(superAdmin)

    } catch (error) {
        console.log(error)
    }
}