import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
// fs means file system. We doesnt need to import 
// it explicitly, cause it will be already there 
// with node.js
// this is mainly used to do operations on the files

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_KEY_SECRET 
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader
        .upload(localFilePath, {
            resource_type:"auto"
        })
        // file has beeb uploaded successfully
        // console.log("File uploaded on cloudinary",response.url);
        fs.unlinkSync(localFilePath)
        // The above line means , after the image is 
        // successfully uploaded to thecloudinary
        // it will be removed from the local repository
        return response
    } catch (error) {
        
    }
}


export {uploadOnCloudinary}