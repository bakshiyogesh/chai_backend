import {asyncHandler} from '../../utils/asyncHandler.js';
import {ApiError} from '../../utils/ApiError.js'
import { User } from '../models/user.model.js';
import {uploadOnCloudinary} from '../../utils/Cloudinary.service.js'
import { ApiResponse } from '../../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
const generateAccessAndRefreshToken=async (userId)=>{
try {
    const user=await User.findById(userId);
    const accessToken=user.generateAccessToken();
    const refreshToken=user.generateRefreshToken();
    user.refreshToken=refreshToken;
    await user.save({validateBeforeSave:false});

    return {accessToken,refreshToken};
} catch (error) {
    throw new ApiError(500,"Something Went wrong while generatingf access and refresh token.")
}
}


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

const loginUser=asyncHandler(async(req,res)=>{
    // req body 
    //username or email
    //find user
    //password check
    // access and refresh token
    // set cookies
    //send response
    const {username,email,password}=req.body;
    if(!(username||email)){
        throw new ApiError(400,"username or password is required");
    }
    const user= await User.findOne({$or:[{username},{email}]})
    if(!user){
        throw new ApiError(404,"User doesn't exist");
    }
    const isPasswordCorrect=await user.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid User Credentials.");
    }

   const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
   
   const loggedInUser=await User.findById(user._id).select("-password -refreshToken");
   const options={
    httpOnly:true,
    secure:true,
   }

   return res.status(200)
   .cookie("acessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(new ApiResponse(200,{
    user:loggedInUser,accessToken,refreshToken
   },"User logged in successfully."))

})

const loggedOutUser=asyncHandler(async(req,res)=>{

    await User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken:undefined
        }
    })
    const options={
        httpOnly:true,
        secure:true,
       }
       return res.status(200).
       clearCookie("accessToken",options).
       clearCookie("refreshToken",options).
       json(new ApiResponse(200,{},"User Logout Successfully"))
})


const refreshToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request");
    }
    try {
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        const user=await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError(401,"Invalid refresh Token");
        }
        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used.");
        }
        const options={
            httpOnly:true,
            secure:true,
           }
    
          const {accessToken,newrefreshToken}= await generateAccessAndRefreshToken(user?._id)
    
           return res.status(200)
           .cookie("accessToken",accessToken,options)
           .cookie("refreshToken",newrefreshToken,options)
           .json(new ApiResponse(200,{accessToken,refreshToken:newrefreshToken},"Access Token refreshed Successfully"))
    
    } catch (error) {
        throw new ApiError(401,error?.message||"Invalid Refresh Token");

    }})
export {registerUser,loggedOutUser,loginUser,refreshToken};