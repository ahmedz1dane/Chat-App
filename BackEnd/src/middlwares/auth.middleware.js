import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// we are not using the res object in the fuction
// so we can put `_` instead of it as follows:
export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // DOUBT 1: how cookies is available in the
    //        req object?
    // ANS:
    // when we are checking the app.js we can see
    // that we have used a middleware named
    // cookie-parser. This middleware will parse
    // the incoming cookie and add a cookie field
    // in the req object

    // DOUBT 2: How come acccesToken is available in
    //        in the cookies that is from the req
    //        object?
    // ANS:
    // Because in the User.controller.js we can see
    // that as response to a user logging in ,we are
    // sending the cookie named accessToken and
    // refreshToken as response. Then the browser
    // will store these in it. Then whenever some
    // request is made from  the client, the browser
    // add these accessToken and refreshTooken as
    // header in the req object. then as we have said
    // in the above , by using the cookie-parser
    // it will become available in the req object
    // so we can access it as req.cookie

    // DOUBT 3:so why cant we use the cookie from the
    //       header itself , why there is a need to
    //       use cookie-parser?
    // ANS:
    // Cause it a better way

    // DOUBT 4:What is the working of the part
    //          req.header("Authorization")?.replace("Bearer ","")?
    // ANS:
    // Authorization is available in the header of the
    // req. These are added by the client .So the
    // client addaccessToken to it. But it will be
    // in a different format like `bearer <accessToken>`
    // so in order to get the accessToken alone we
    // have to remove the bearer<space>. thats what
    // we are doing in that part

    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
    // DOUBT: How id is available in the decodedToken
    // ANS:
    // When creating the accessToken by using jwt in
    // the user.model.js, we can see that we have
    // passed the object _id, so here we are retriving
    // it

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    // adding req.user in the req object:
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(404, error?.message || "Invalid access token");
  }
});
