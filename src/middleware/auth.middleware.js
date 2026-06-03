import { user } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  jwt  from "jsonwebtoken";

export const verifyJWT = asyncHandler(async(req,res,next)=>{
   try {
     const token =req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ","")
     if (!token) {
         throw new ApiError(404,"Unautorised request")
     }
 
     const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
     const User = await user.findById(decodedToken?._id).select("-password -refreshToken")
     if (!User) {
         throw new ApiError(401,"invalid Access Token")
 
     }
 
     req.User=User;
     next()
   } catch (error) {
    throw new ApiError(401,error?.message|| "invalid access token")
   }
})
