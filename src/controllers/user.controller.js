import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {user} from "../models/user.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { JsonWebTokenError } from "jsonwebtoken";

const generateAccessAndRefereshToken = async(userId)=>
    {
    try {
       const User = await user.findById(userId)
       const accessToken = User.generateAccessToken()
       const refreshToken = User.generateRefreshToken()
       
       User.refreshToken = refreshToken
       await user.Save({validateBeforeSave:false})

       return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"something went wrong while generate and refresh token")
    }

    }


import { uploadOnCloudinary } from "../utils/cloudinary.js";
const registerUser = asyncHandler(async(req,res)=>{
    
     const {fullName , email, username, password}=req.body 
    // console.log("email",email);

    if (
    [fullName, email, username, password].some((field)=>field?.trim()==="") ) {
    throw new ApiError(400,"all fields required")
    }

    const existedUser = await user.findOne({
        $or: [{username},{email}]
    })

    if (existedUser) {
        throw new ApiError(409," user already existed")
    }

    // const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.covarImage[0]?.path;

    // console.log(req.files);

    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage)
        && req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is required ")
    }

    //  const avatar = await uploadOnClodinary(avatarLocalPath)
    // console.log("avatarLocalPath:", avatarLocalPath);

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    // console.log("avatar:", avatar);
     const coverImage = await uploadOnCloudinary(coverImageLocalPath)

     if (!avatar) {
        throw new ApiError(409," avatar file is required ")
    }

    const createdUserRecord = await user.create({
        fullName,
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser =  await user.findById(createdUserRecord._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User register successfully" )
    )



}) 

const loginUser = asyncHandler(async(req,res)=>{
//username, email password from user
//validation for empty space
//check from database
//refresh field 



    const {username,email,password} = req.body


    if (!(username || email)) {
        throw new ApiError(404,"Enter username or email")
    }

    const User = await user.findOne({
        $or:[{username},{email}]
    })

    if (!User) {
        throw new ApiError(404,"User does not exist")
    }

    const isPasswordValid= await User.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401,"password incorrect")
    }

     const {accessToken,refreshToken}= await generateAccessAndRefereshToken(User._id) 

    const loggedInUser = await user.findById(User._id).select("-password -refreshToken")

    const option = {
         httpOnly:true,
        secure: true
    }

    return res.status(200).cookie("accessToken",accessToken,option).cookie("refreshToken",refreshToken,option).json(
        new ApiResponse(
            200,
            {
              user:  loggedInUser,accessToken,refreshToken 
            },
            "User logged In Successfully"
        )
    )
})


const logoutUser = asyncHandler(async(req, res)=>{

       await  user.findByIdAndUpdate(
        req.User._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
        )
       
    const option = {
         httpOnly:true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(new ApiResponse(200,{},"user logged out"))

})

const refreshAccessToken = asyncHandler(async(req,res)=>{
     const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
     if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
     }

    try {
         const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
         )
    
         const User = await user.findById(decodedToken?._id)
         if(!User){
            throw new ApiError(401,"invalid refresh token ")
         }
    
         if(incomingRefreshToken !== User?.refreshToken){
            throw new ApiError(401," refresh token is expired or used ")
         }
    
         const option ={
            httpOnly:true,
            secure: true 
         }
    
         const {accessToken,newRefreshToken}=await generateAccessAndRefereshToken(User._id)
    
         return res
         .status(200)
         .cookie("accessToken",accessToken,option )
         .cookie("refreshToken ",newRefreshToken,option)
         .json(
           new ApiResponse(
            200,
            { accessToken,refreshToken:newRefreshToken},
            "access Token Refreshed "
           )
         )
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token")
    }


})

const changeCurruntPassword = asyncHandler(async(req,res) =>{
    const {oldPassword , newPassword}=req.body
    const User = await user.findById(req.User?._id)
    const isPasswordCorrect = await User.isPasswordCorrect(oldPassword)
    if (isPasswordCorrect) {
        throw new ApiError(400,"invalid Old Password")
    }
    User.password = newPassword
    await User.save({validateBeforeSave:false})
    return res
    .status(200)
    .json(new ApiResponse(200,{},"password changed"))
})

const getCurruntUser = asyncHandler(async(req,res)=>{
    return res 
    .status(200)
    .json(200,req.User,"Currunt user fetched succesfully")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email,username} = req.body
    if (!fullName || !email) {
        throw new ApiError(400,"all fields are required")

    }

    const User = await user.findByIdAndUpdate(
        req.User?._id,
        {
           $set:{
                fullName,
                email
           }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,User,"account ddetails update successfilly"))


})

const updateUserAvatar = asyncHandler(async(req,res)=>{
     const avatarLocalPath = req.file?.path
     if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is missing")
     }

      const avatar = await uploadOnCloudinary(avatarLocalPath)

      if(!avatar.url){
         throw new ApiError(400,"Error while uploading on avatar")
      }

      const User = await user.findByIdAndUpdate(
        req.User?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")
    return res
    .status(200)
    .json(200,user,"avatar updated successfully")

})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
     const coverImageLocalPath = req.file?.path
     if (!coverImageLocalPath) {
        throw new ApiError(400,"cover image  is missing")
     }

      const coverImage  = await uploadOnCloudinary(coverImageLocalPath)

      if(!coverImage.url){
         throw new ApiError(400,"Error while uploading on avatar")
      }

      await user.findByIdAndUpdate(
        req.User?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    ).select("-password")
    return res
    .status(200)
    .json(200,user,"cover image updated successfully")
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} =req.params
    if (!username?.trim()) {
        throw new ApiError(401,"Username is missing")
    }

    const channel = await user.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            },
            $lookup:{
                from:"subscription",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            },
            $lookup:{
                from:"subscription",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            },
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelSubscribedTo:{
                    $size:"subscribedTo"
                },
                isSubscribed:{
                  $cond:{
                    if:{$in:[req.User?._id,"$subscribers.subscriber"]},
                    then:true,
                    else: false
                  }  
                }
                
            },
            $project:{
                fullName: 1,
                username: 1,
                subscribersCount:1,
                channelSubscribedTo:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1

            }
        }
          
    ])

    if (!channel?.length) {
        throw new ApiError(400,"channel does not exits")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"Channel fetched successfully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurruntPassword,
    getCurruntUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile
}