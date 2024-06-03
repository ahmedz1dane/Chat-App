import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResposnse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// WHAT IS THE PURPOSE OF ACCESSTOKENS:
// SUPOSE WE ARE GONNA ACCESS SOME IMPORT DATA
// FROM THE SERVER. IN SUCH CASE INSTEAD OF
// INCLUDING THE USERNAME AND PASSWORD EACH TIME
// IT IS CONVINIENT TO USE THESE TOKENS, FOR BETTER
// SECURITY BECAUSE THESE TOKENS WILL BE REFRESHED.

// HOW THIS ACCESTOKEN IS USED BY CLIENT FOR THE
// ABOVE MENTIONED PURPOSE ?

// WE CAN SEE IN THE END OF THE LOGIN FUNCTION WE
// ARE CREATING A COOKIE WHICH WE WILL SEND TO THE
// CLIENT AS RESPONSE. THIS COOKIE WILL BE STORED IN
// THE BROWSER OF THE CLIENT. AND WHENEVER A REQUEST
// IS MADE FROM THE CLIENT , THE BROWSER AUTOMATICALLY
// ADDS THESE ACCESSTOKEN AS HEADER

// we are using accessToken and Refresh token frequently
// so we are gonna use a function for it as below:

const generateAccessAndRefreshTokens = async (userId) => {
  // DOUBT: from where we got UserId:
  // ANS: by going below we can see that we had
  //      retrieved the particular document from
  //      from the mongoDB by using findOne
  //      from that we will be able to retrieve
  //      the userId very easily
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    // DOUBT: why saved is used ?
    // ANS:

    // it is used for the purpose of updating the
    // data in the database
    await user.save({ validateBeforeSave: false });
    // when we are updating the data in the databese
    // it automatically validate the document that
    // we have updated with the schema of that particular
    // document
    // validateBeforeSave is set to false because
    // we doesnt want to perform that

    // DOUBT: why this paricular condition is used here ?
    // CHECK THIS!!!!

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // ALGORITHM:

  //get user details from frontend
  // validation - like checking any field empty or not
  // check if user already exist: username,email
  // check for images, check for avtar
  // upload them to cloudinary, check for avtar
  // create user object (cause in mongoDB is nosql) - create entry in db

  // DOUBT 1: look what is happening
  // remove password and refresh token field from response

  // check for user creaation
  // if created , return response otherwise return error

  // data from form and json are available in req.body
  // STEP1:
  const { fullName, email, username, password } = req.body;
  // console.log("email", email)

  // STEP2:
  if (
    [fullName, email, username, password].some(
      (field) =>
        // DOUBT: Why some is used in the above?
        // ANS: some is used to check , wheter
        //      any of the elements in the list
        //      satisfies the condition

        field?.trim() === ""
      // DOUBT: why ?. is used ?
      // ANS: it is used to avoid the error
      //      that may arise when we are
      //      applying function like trim() ect
      //      on the undefined feilds
    )
  ) {
    throw new ApiError(400, "All fields are reqired");
  }

  // Checking whether the user already exist or not

  // STEP3:

  // WARNING:
  // whenever we are communcating with database
  // which is in other continent we need to use
  // await , otherwise error will be thrown

  const existedUser = await User.findOne({
    // here in the above User is the model, that
    // can be used to access the database and
    // check whether the values are there or not
    // in the databases
    $or: [{ email }, { username }],
    // here $or is used cause we are checking
    // if one of the specidied feilds is there in
    // the database or not
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // STEP4:

  console.log(req.files);
  // by using multer we are taking the images sent
  // from the client and storing them in loaclfolder
  // in the server
  // Then we are taking the location of that place as
  // follows:
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // since we are using multer, it will give us the
  // files object, in that we aill access the avatar
  // avatar is an array and we access the firrst
  // element of the avatar , and from that we will
  // access the local path

  // the below code is showing some error when we
  // doesnt give coverImage in POST:
  // const coverImageLocalPath = req.files?.coverImage[0]?.path

  // To solve the error that is mentioned above
  // we can do as follows:

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // in the following we are checking whether
  // the image is in the local file or not
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // STEP5:

  // Below we can see that, we are uploadinf
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // console.log(avatar);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // avatar is a required feild so we check again
  // whether it is uploaded or not in the cloudinary
  // as follows:

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // STEP6:

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    // DOUBT: why we are using here ?. and not in
    //        case of avatar
    // ANS: cause by checking the previous written
    //      code we can see that , in casee of avatar
    //      we are checking for its existence more
    //      than one time since its compulsury field
    //      but in case of coverImage we are not
    //      doing so . Therefore we need to check
    //      that , inorder not to produce any error
    email,
    password,
    username: username.toLowerCase(),
  });

  // STEP7:

  // we are gonna remove refreshToken and password
  // feild from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
    // here we are using select to remove those
    // specified feilds (thats why we are using
    // the -(minus) sign)
  );

  // STEP8:

  // Checking the creation of the object
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // this is the rason why we have removed password
  // and refreshToken (that is for sending response)
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
  // DOUBT 1 : why 2 status code is used in the
  //           above case ?
  // ANS: When you are using the postman , you can understand
  //      this, cause in this 2 status code , one will be shown
  //      in the title bar and the other will be shown in the
  //      json body
});

const loginUser = asyncHandler(async (req, res) => {
  // data <- req body
  // username or email
  // find the user
  // password check
  // access and refresh token
  // send cookies

  const { username, password } = req.body;

  if (!username) {
    throw new ApiError(400, "Username or password is required");
    // DOUBT: Why new is used ?
    // ANS: Cause we are creating
    //      the object of ApiError
  }

  const user = await User.findOne({ username });
  // DOUBT: see what user is

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // DOUBT:Why user instead of User ?
  // ANS:

  // in the below we can see a situation  , we are
  // using (u)ser instead of (U)ser because User
  // is an instance of mongoose , whereas user
  // is ours , that we have retrieved from the mongoDB
  // findOne etc are the methods of mongoose , so
  // we will be using User with it (cause its the
  // instance of mongoose itself). Whereas
  // isPasswordCreate is method that we had created
  // so we has to use the user that is ours instedof
  // that of mongoose (User)
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credential");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Now we are gonna create cookies and sent it
  // to user
  // DOUBT: Why cant we use the user object jst above?
  // ANS:

  // Cause in jst above we can see that we are
  // updating our database with refreshToken
  // but that is not available in the user Object
  // cause we have created it before we are updating
  // the database . Therefore it doesnt contains the
  // updated data. So that is  the reason behind we
  // are creating loggedInUser

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    sameSite: true,
    // means that , this particular cookie can
    // be accessed only by using http . Which
    // enhanses the security
    secure: true,
  };

  return (
    res
      .status(200)

      .cookie("accessToken", accessToken, options)
      // here the name of the cookie is accessToken
      // then we pass the data and the options

      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            data: loggedInUser,
            accessToken,
            refreshToken,
          },
          "User logged in Successfully"
        )
      )
  );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
      // specifies whether to return the original
      // or the updated ducument. Here sice we
      // specifies true, the updated document is
      // returned
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

// WORKING OF BELOW CODE:
// the access token will expire after its specified
// expiration time , then we have to refresh it
// using the refresh token . That is what we are
// doing below:
// There we can see that we are taking the refresh
// token from the client and then checking it
// whether it is as same as that in the database
// after that new access and refresh tokens are made
// and then send them as response to the client
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newrefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newrefreshToken,
          },
          "AccessToken refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refreshToken ");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // DOUBT: We need to find the details of the user
  //        how we will be able to find that ?
  // ANS:

  // in order to change the password we know
  // that we need to log in . by checking the
  // user.routes.js we can see that while logging
  // in we have used a middleware named verifyJWT
  // where we are adding the user as an element in
  // the req object. So we can access the user
  // from the req object

  const user = await User.findById(req.user._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  // DOUBT: here in the above we need to change
  //        the password in the
  //        database know? , but in the above
  //        data in the user is getting chnged why ?
  // ANS:

  await user.save({ validateBeforeSave: false });
  // DOUBT: Why cant we use User.findByIdAndUpdate()
  // ANS:

  // When we check the user.model.js there we can see
  // that we have written  middleware named `pre` ,
  // that has
  // to check a condition when (u)ser.save() is used
  // (to encrypt the password before it is saved
  // to the database)
  // so inorder to run that middleware we are using
  // save , otherwise we could have used
  // (U)ser.findByIdAndUpdate()

  // DOUNT: what is the difference between
  // (u)ser.method_name()
  // and (U)ser.method_name()?
  // ANS:

  // small user is the user that we have retrieved
  // we will be using the middleware(methods)
  //  that we have made by ourselves on it
  // where as the big User is from the database
  // sp we use the methods that are built in on it

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User fetched successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();

  return res
    .status(200)
    .json(new ApiResponse(200, users, "All users fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        // the above is same as
        // fullName: fullName
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  // when we compare the code in the above with
  // the code that is there in the register part
  // we can see that , here the code is less
  // because there therre where multiple files
  // (cover and avatar image), where as here
  // there is only one image (avatar) is there.

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  // TODO: Delete old image from the cloudinary

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error whikle uploading cover image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"));
});

const getUserChannelProfile = asyncHandler(
  // THIS IS THE DASHBOARD OF EACH USER
  // So there will be the username of each user
  // in the url
  async (req, res) => {
    const { username } = req.params;
    // taking the username from the url

    if (!username?.trim()) {
      throw ApiError(400, "username is missing");
    }

    const channel = await User.aggregate([
      {
        $match: {
          username: username?.toLowerCase(),
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          // in the model we can see that
          // its `Subscription`, then why here
          // we are using `subscriptions`,  cause
          // we will be using like that only
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo",
        },
      },
      {
        $addFields: {
          subscribersCount: {
            $size: "$subscribers",
          },
          channelSubscribedToCount: {
            $size: "$subscribedTo",
          },
          isSubscribed: {
            $cond: {
              if: { $in: [req.user?._id, "$subscribers.subscriber"] },
              // DOUBT: What is happening in the above line
              // ANS:

              // I think
              // Suppose if we want to find whether a particular
              // user is subscribed to a paricular channel.

              // so suppose if the current user has the id 100
              // then by using the aggregator we will check
              // the above condition and add that whether the
              // user 100 has subscribed that particular channel
              // or not and add as a field in that collection
              // This will get changed, whenever the current user
              // changes

              // HOW THE CONDITION WORKS:

              // $in is used to check whether req.user._id is
              // present in the following array or not

              // we know that if the id of the current user is
              // present in the $subscribers.subscriber of a
              // document in the User,  then that particular
              // current user is subcriber of that particular
              // channel
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          // DOUBT: What is the purpose of
          //        $project?
          // ANS:

          // it defines what all should be
          // there in the output of the
          // aggregation
          // Suppose if we doesnt add this
          // $project, then all the content
          // in the existing document + all
          // the things we have done in the
          // aggregation will be there in the
          // output

          fullName: 1,
          username: 1,
          subscribersCount: 1,
          channelSubscribedToCount: 1,
          isSubscribed: 1,
          avatar: 1,
          coverImage: 1,
          email: 1,
        },
      },
    ]);

    if (!channel?.length) {
      throw new ApiError(404, "Channel doesnt exist");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
      );
  }
);

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
      // DOUBT:why cant we give req._id why there is need to use
      //      in this way

      // ANS:
      //  When you see the mongoDB you can see that the id will
      // be of the form ObjectId(''). But when we use the req._id
      // we will be only getting the string inside it. But when
      // we are using the methods from the mongoose , we will
      // get yhe whole ObjectId(''), like findById etc.
      // That is the reason we are uisng like this
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  getAllUsers,
};
