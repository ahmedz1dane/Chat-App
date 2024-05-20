const asyncHandler = (requestHandler) => {
    // DOUBT: What is happening in the below line:
    // ANS: asyncHadler is a higher order function
    //      that means , it will be return another
    //      function
    //      we are taking req, res, next as the 
    //      arguments for that function and we are 
    //      passing these arguments to the function 
    //      that we are wrapping inside it


    return (req, res, next) => {//here we have to return the function , otherwise the error will occur
         Promise.resolve(requestHandler(req, res, next))
        // DOUBT: why promise.resolve is used ?
        // ANS: to bring consistency in the code
        //      cause some funcrions may return a
        //      promise and some may not retrn a
        //      promise . If a promise is  returned
        //      Promise.resolve is ignored , otherwise
        //      the result is wrappedd inside the 
        //      resolved promise , which will help us
        //      to achieve consistant error handling

        // DOUBT: what happens in error handling if 
        //        we doesnt use Promise.resolve() ?
        // ANS: if we dont use promise.resolve() we
        //      may need to use the try catch block
        //      to handle the error from the function
        //      that doenst return promise . so we can 
        //      say that we use the .catch() to handle 
        //      the error inthe function that return 
        //      promise

        .catch((err) => next(err))
        // Here err is passed to the next function
        // (that means to the next malware)
    }
}


export {asyncHandler}

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }


// STUDY THE EXPLAINATION OF THE FUNCTIONS 
// JUST REWIND AND WATCH THE VIDEO ALSO