import multer from "multer";


// DOUBT: why there is the need of diskStorage?
// ANS: 

// It is one of the storage engines of multer
// and it helps to define the storage place
// and the name with which the file has to be stored
// in that specified place
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    // req: is an object that contains http request details
    // file:is an object that contains details about file
    // cb: is a callback function that is given by multer
    //      implicitly inorder to communicate with it.
    //      its syntax will be as follows: 
    //      first parameter represents error, here 
    //      we can see that null is given since no error
    //      second parameter will be the destination
    //      in which the file should be saved
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    // here in the above case, we can see that 
    // original filename is prefered when the file is
    // saved in the folder specified   
    }
  })
  
  export const upload = multer({
     storage 
    })