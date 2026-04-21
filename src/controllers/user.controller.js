import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {user} from "../models/user.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const generateAccessAndRefereshToken = async(userId)=>
    {
    try {
       const User = user.findById(userId)
       const accessToken = User.generateAccessToken()
       const refreshToken = User.generateRefreshToken()
       
       User.refreshToken = refreshToken
       await user.Save({validateBeforeSave:false})

       return {accessToken,refreshToken}

    } catch (error) {
        throw new AppiError(500,"something went wrong while generate and refresh token")
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

    if (!username || !email) {
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

     const {accessToken,refreshToken}=await generateAccessAndRefereshToken(User._id) 

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

    const logoutUser = asyncHandler(async(req, res)=>{

    })
})

export {
    registerUser,
    loginUser,
    logoutUser
}