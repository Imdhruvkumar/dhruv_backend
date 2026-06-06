import { Router } from "express";
import { loginUser, logoutUser,updateUserAvatar,updateUserCoverImage, registerUser,getCurruntUser,updateAccountDetails ,refreshAccessToken,changeCurruntPassword, getUserChannelProfile, getUserWatchHistory } from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {  
             name:"avatar",
             maxCount: 1   
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/logoutUser").post(verifyJWT,logoutUser)
router.route("/change-password").post(changeCurruntPassword)
router.route("/currunt-user").get(verifyJWT,getCurruntUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/update-coverimage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getUserWatchHistory)
export default router 