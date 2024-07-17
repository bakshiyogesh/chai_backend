const asyncHandler=(callbackFn)=>async(req,res,next)=>{
    try {
        await callbackFn(req,res,next)
    } catch (error) {
        res.status(err.code||500).json({
            success:false,
            message:err.message
        })
        console.error("Error",error);
    }
}


const asyncHandler2=(callbackFn)=>{
    (req,res,next)=>{
        Promise.resolve(callbackFn(req,res,next)).catch((err)=>next(err))
    }

}




export {asyncHandler};