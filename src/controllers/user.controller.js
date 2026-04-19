import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {user} from "../models/user.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";
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

export {registerUser}