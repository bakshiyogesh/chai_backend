import {asyncHandler} from '../../utils/asyncHandler.js';
import {ApiError} from '../../utils/ApiError.js'
import { User } from '../models/user.model.js';
import {uploadOnCloudinary} from '../../utils/Cloudinary.service.js'
import { ApiResponse } from '../../utils/ApiResponse.js';
const registerUser=asyncHandler(async (req,res)=>{
    // get user details from frontend
    // validation -not empty
    // check if already exists -username/email
    // check for images of avatar,cover imaage
    // upload them  to cloudinary,avatar
    // create user object - create entry in db
    // remove password and refresh token field from response of db
    // check for user creation
    // return response
    const{username,fullName,email,password}=req.body
    if([fullName,email,username,password].some((field)=>field?.trim()==="")){

        throw new ApiError(400,"All fields are required")
    }
    // if("/^\S+@\S+\.\S+$/".test(email)){
    //     throw new ApiError(400,"Enter Correct Email Address")
    // }
    // console.log('email',email,password)

    const isUserExisted=await User.findOne({$or:[{username},{email}]})
    if(isUserExisted){
        throw new ApiError(409,"User with email or username already exist.")
    }
    const avatarLocalPath=req.files?.avatar[0]?.path;
    // const coverImageLocalPath=req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files&& Array.isArray(req.files.coverImage)&&req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required.");
    }
    console.log("avatatLocalFilePath",avatarLocalPath)
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new ApiError(400,"Avatar is required");
    }

   const user=await User.create({
        fullName,
        avatar:avatar.url,
        email,
        coverImage:coverImage?.url||"",
        password,
        username:username.toLowerCase()
    })

    const createdUser=await User.findById(user._id).select("-password -refreshToken"); //for deselecting the password and refreshtoken

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user.")
    }
    
    return res.status(201).json(new ApiResponse(200,createdUser,"User Registered Successfully."));
})

export {registerUser}