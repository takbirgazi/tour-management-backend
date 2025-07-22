
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params: {
        public_id: (req, file) => {
            const fileName = file.originalname
                .toLocaleLowerCase()
                .replace(/\s+/g, "-")
                .replace(/\./g, "-")
                // eslint-disable-next-line no-useless-escape
                .replace(/[^a-z0-9\-\.]/g, "");

            const extension = file.originalname.split(".").pop();
            const uniqueidName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileName + "." + extension;

            return uniqueidName;
        }
    }
});


export const multerUpload = multer({
    storage: storage
});