import mongoose, {Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true  
            // Searching field will be enabled to 
            // search username. I think so
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String, 
            // URL of cloudinary cause we have already 
            // said that in MongoDB we wont save images
            // or videos ,rather we save them in a third
            // party service like cloudinary and then
            // we will saave that particular URL in our
            // MongoDB  
            required:true
        },
        coverImage:{
            type:String, // Cloudinary link

        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:String,
            required:[true, 'Password is required']
        },
        refreshToken:{
            type:String
        }
    },{
        timestamps:true
    }
    )

// WORKING OF THE FOLLOWING CODE:
// here pre is the middleware which is used to do
// some task on the data in the model . Here in this 
// case we can see that we have used the event "save" 
// which means we are gonna do something on the 
// specified data in the model before it is gonna 
// be saved in the database .
// Here in this case we can see that we are using the
// bcrypt to hash the password

userSchema.pre("save", async function (next) {

    // DOUBT: Why cant we use arrow function () => {} here ?
    // ANS: Cause we can see that we are using this 
    //      keyword below

    if(!this.isModified("password")) return next();
    // DOUBT: WHY THE NEXT IS USED?
    


    // DOUBT: What is the purpose of the above line ?
    // ANS: cause we need to hash and store the 
    //      password in the database only when 
    //      it is changed . So we are checking here
    //      whether the password is changed or not
    //      if password is not changed the retrn next()
    //      gets executed
        this.password = await bcrypt.hash(this.password, 10)
        next()

        // DOUBT:WHy there is a need to use next() ?
        // ANS: It is necessary to signal the 
        //      execution of the next middleware or 
        //      in this case the saving of the data to
        //      the database . If we doesnt use that 
        //      it may cause some problems
    
})


// WORKING OF THE BELOW CODE:
// its actually used to compare the password that 
// is stored in the database with some plain 
// password (as we can see it an instance method for 
// the model)

userSchema.methods.isPasswordCorrect = async function
(password){
    return await bcrypt.compare(password, this.password)
}

// WORKING OF THE BELOW 2 (ACCESS TOKENS & REFRESH TOKENS):

// When a user logins he will be getting access token
// which usually will be having small life span as
// specified in the .env file. This tokens can be used
// by the user to access resources or other things in
//  the server without logging in each time
// Whereas refresh tokens are used to give the access
// tokens when they get expired, without the need of 
// logging in again 

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            // We doesnt need to generate this, cause 
            // it will be there in the mongoDB automatically
            email: this.email,
            usename: this.usename,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFERSH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)