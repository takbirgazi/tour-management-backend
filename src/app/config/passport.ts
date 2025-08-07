import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/users/user.model";
import { IsActive, Role } from "../modules/users/user.interface";
import { Strategy as LocalStrategy } from "passport-local";
import bcryptjs from 'bcryptjs';



passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email: string, password: string, done) => {
        try {
            const isExistUser = await User.findOne({ email });
            if (!isExistUser) {
                return done(null, false, { message: "User does not found" });
            }

            if (!isExistUser.isVerified) {
                return done("User is not verified")
            }

            if (isExistUser.isActive === IsActive.BLOCKED || isExistUser.isActive === IsActive.INACTIVE) {
                return done(`User is ${isExistUser.isActive}`)
            }
            if (isExistUser.isDeleted) {
                return done("User is deleted")
            }

            const isGoogleAuth = isExistUser?.auths.some(provObj => provObj.provider == "google");

            if (isGoogleAuth && !isExistUser.password) {
                return done(null, false, { message: "You are register with google before." })
            }

            const isPasswordMath = await bcryptjs.compare(password as string, isExistUser.password as string);

            if (!isPasswordMath) {
                return done(null, false, { message: "Password not match!" });
            }

            return done(null, isExistUser);
        } catch (error) {
            return done(error)
        }
    })
);

passport.use(
    new GoogleStrategy({
        clientID: envVars.GOOGLE_CLIENT_ID,
        clientSecret: envVars.GOOGLE_CLIENT_SECRET,
        callbackURL: envVars.GOOGLE_CALLBACK_URL
    }, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
        try {
            const email = profile.emails?.[0].value;
            if (!email) {
                return done(null, false, { message: "Email not found!" })
            }
            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({
                    email,
                    name: profile.displayName,
                    picture: profile.photos?.[0].value,
                    role: Role.USER,
                    isVerified: true,
                    auths: [
                        {
                            provider: "google",
                            providerId: profile.id
                        }
                    ]
                })
            };

            return done(null, user);
        } catch (error) {
            return done(error)
        }
    })
);


// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});