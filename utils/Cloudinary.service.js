import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary=async(localFilePath)=>{
    try {
        
        if(!localFilePath) return null
        const uploadResponse=await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })
        console.log('file is uploaded',uploadResponse.url)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as upload operation failed
        return null;
    }
}

export {uploadOnCloudinary};