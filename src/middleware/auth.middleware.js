import { user } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import  jwt  from "jsonwebtoken";

export const verifyJWT = asyncHandler(async(req,res,next)=>{
   try {
     const token =req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ","")
     if (!token) {
         throw new ApiError(404,"Unautorised request")
     }
 
     const decodedToken = jwt.verify(token,proccess.env.ACCESS_TOKEN_SECRET)
 
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
