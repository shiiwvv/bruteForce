import express from "express";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { validateEmail } from "../utils/emailValidator.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../../service/cloudinary.service.js";
import { inputValidate } from "../utils/inputValidation.js";
import {
  cookieOptions,
  DEFAULT_AVATAR,
  generateRandomString,
  welcomeText
} from "../constants.js";
import { agenda } from "../../service/agenda.service.js";
import fs from "fs";
import { emailQueue } from "../../redis/queue.redis.js";
import crypto from "crypto";

// utilities/tokenGenerator.js
const accessAndRefreshTokenGeneration = async (userId) => {
  try {
    const userObj = await User.findById(userId);
    if (!userObj) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = await userObj.generateAccessToken();
    const refreshToken = await userObj.generateRefreshToken();

    userObj.refreshToken = refreshToken;
    await userObj.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Refresh and Access Token Generation Failed");
  }
};

const handleUserSignUpReqWithGitHub = asyncHandler(async (req, res) => {
  const randomString = generateRandomString(32);
  console.log("randomeString: ", randomString);

  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.append("client_id", process.env.GITHUB_CLIENT_ID);
  githubAuthUrl.searchParams.append(
    "redirect_uri",
    process.env.GITHUB_REDIRECT_URI || "http://localhost:5000/api/v1/user/signup/github/callback",
  );
  githubAuthUrl.searchParams.append("response_type", "code");
  githubAuthUrl.searchParams.append("scope", "read:user user:email");
  githubAuthUrl.searchParams.append("state", randomString);

  const customizedCookieOptions = {
    ...cookieOptions,
    maxAge: 5 * 60 * 1000,
  };

  return res
    .cookie("requestState", randomString, customizedCookieOptions)
    .redirect(githubAuthUrl);
});

const handleGitHubOAuthCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const { requestState } = req.cookies;

  console.log("req.cookies ", req.cookies);

  console.log("state: ", state);
  console.log("state(typeof): ", typeof state);

  console.log("requestState: ", requestState);
  console.log("requestState(typeof): ", typeof requestState);

  if (!code) {
    return res.status(400).send("Authorization code missing from GitHub");
  }
  if (!requestState || requestState !== state) {
    return res.status(403).send("Security Error: CSRF state mismatch");
  }

  try {
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: code,
          redirect_uri: process.env.GITHUB_REDIRECT_URI,
        }),
      },
    );

    console.log("tokenResponse: ", tokenResponse);
    console.log("tokenResponse type: ", typeof tokenResponse);

    const tokenData = await tokenResponse.json();
    console.log("tokenData: ", tokenData);
    console.log("tokenData type: ", typeof tokenData);
    const gitHubAccessToken = tokenData.access_token;

    if (!gitHubAccessToken) {
      throw new Error(
        `Failed to fetch access token: ${tokenResponse.statusText}`,
      );
    }

    const userProfileResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${gitHubAccessToken}` },
    });

    const userProfile = await userProfileResponse.json();
    const userEmailsResponse = await fetch(
      "https://api.github.com/user/emails",
      {
        headers: { Authorization: `Bearer ${gitHubAccessToken}` },
      },
    );
    const emailsArray = await userEmailsResponse.json();

    const primaryEmailObj = emailsArray.find(
      (email) => email.primary === true && email.verified === true,
    );

    const userEmail = primaryEmailObj ? primaryEmailObj.email : null;

    console.log("emailsArray: ", emailsArray);

    let user = await User.findOne({ email: userEmail });

    if (!user) {
      let username = userProfile.login;

      const checkUser = await User.findOne({ username });
      if (checkUser) {
        username = `${username}_${generateRandomString(4)}`;
      }

      user = await User.create({
        username,
        email: userEmail,
        firstName: userProfile.name || username,
        authProvider: 'github',
        avatar: DEFAULT_AVATAR
      });

      if (!user) {
        throw new ApiError(500, "Failed to create user in DB");
      }
    }

    const { accessToken, refreshToken } = await accessAndRefreshTokenGeneration(user._id);
    res.clearCookie("requestState");

    res.cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions);

    const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    return res.redirect(`${frontendBase}/dashboard`);

  } catch (error) {
    console.error("Error during GitHub OAuth callback:", error);
    return res.status(500).send("Internal Server Error");
  }
});

//Checked
const handleUserSignUpReq = asyncHandler(async (req, res) => {
  const { username, firstName, secondName, email, password } = req.body;

  if (inputValidate([username, firstName, secondName, email, password])) {
    throw new ApiError(400, "All Fields Are required");
  }

  const existedUser = await User.find({
    $or: [{ username }, { email }],
  });

  if (existedUser.length !== 0) {
    throw new ApiError(409, "Account with Email Or UserName Already Exists");
  }

  await validateEmail(email);

  let avatarLocalFilePath = req.file?.path;
  if (!avatarLocalFilePath) {
    avatarLocalFilePath = null;
  }

  const avatarUploadCloud = await uploadOnCloudinary(avatarLocalFilePath);

  const createUser = await User.create({
    username,
    firstName,
    secondName,
    email,
    password,
    avatar: avatarUploadCloud
      ? {
        url: avatarUploadCloud.url,
        public_id: avatarUploadCloud.public_id,
      }
      : DEFAULT_AVATAR,
  });

  if (!createUser) {
    await deleteFromCloudinary(avatarUploadCloud.public_id);
    if (avatarLocalFilePath && fs.existsSync(avatarLocalFilePath)) {
      fs.unlink(avatarLocalFilePath);
    }
    throw new ApiError(500, "Failed To Create User Doc in DB");
  }

  const subject = "Welcome to bruteForce.com — Your Account Is Ready 🚀";
  const text = welcomeText(createUser.username);

  const job = await emailQueue.add(
    "email-queue",
    {
      sendTo: createUser.email,
      subject,
      text,
      html: null,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, createUser, "User SignedUp Successfully"));
});

//Checked
const handleSignInReq = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (inputValidate([usernameOrEmail, password])) {
    throw new ApiError(400, "username and password Required");
  }

  const user = await User.find({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  });

  if (user.length === 0) {
    throw new ApiError(400, "No Such User Found in the database");
  }

  const passwordValidate = await user[0].passwordValidation(password);

  if (!passwordValidate) {
    throw new ApiError(400, "Incorrect Password");
  }

  const { accessToken, refreshToken } = await accessAndRefreshTokenGeneration(
    user[0]._id,
  );

  const loggedInUser = await User.findById(user[0]._id).select(
    "-refreshToken -password",
  );

  const customizedCookieOptions = {
    ...cookieOptions,
    maxAge: 10 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, customizedCookieOptions)
    .cookie("refreshToken", refreshToken, customizedCookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          loggedInUser,
          accessToken,
          refreshToken,
        },
        "User SuccessFully LoggedIn",
      ),
    );
});

//Checked
const handleSignOutReq = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  console.log("req.user: ", req.user);

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid UserId");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      returnDocument: "after",
    },
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User Logged Out Success"));
});

//Handle Peramenet Account Delete..
// const handleDeleteAccount

//Checked
const handleAccountUpdateReq = asyncHandler(async (req, res) => {
  const { username, firstName, secondName } = req.body;

  if (!isValidObjectId(req.user?._id)) {
    throw new ApiError(400, "Invalid UserId");
  }

  const updateObj = {};

  if (username) {
    updateObj.username = username;
  }
  if (firstName) {
    updateObj.firstName = firstName;
  }
  if (secondName) {
    updateObj.secondName = secondName;
  }

  const user = await User.findByIdAndUpdate(req.user?._id, updateObj, {
    returnDocument: "after",
  });

  if (!user) {
    throw new ApiError(500, "failed to process update request");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Updation SuccessFull"));
});

//Checked
const handleChangeEmailReq = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.user?._id)) {
    throw new ApiError(400, "Invalid UserId");
  }

  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email Required for change req");
  }

  const checkEmail = await User.findOne({ email, _id: { $ne: req.user._id } });
  if (checkEmail) {
    throw new ApiError(400, "Email already linked with another account");
  }

  await validateEmail(email);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      email: email,
    },
    { returnDocument: "after" },
  );

  if (!user) {
    throw new ApiError(500, "Failed to update email");
  }

  await agenda.now("change email", { email });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Email Updated Successfully"));
});

//Checked
const handleChangePasswordReq = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.user?._id)) {
    throw new ApiError(400, "Invalid UserId");
  }

  const { confirmPassword, newPassword, oldPassword } = req.body;

  if (inputValidate([confirmPassword, newPassword, oldPassword])) {
    throw new ApiError(400, "Need OldPassword , newPassword , confirmPassword");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(500, "failed To Fetch the corresponding user object");
  }

  const passValidation = await user.passwordValidation(oldPassword);
  if (!passValidation) {
    throw new ApiError(400, "Invalid oldPassword");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "newPassword and confirmation field doesn't match");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Password Changed Successfullyy"));
});

//Checked
const handleAvatarUpdateReq = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid UserId");
  }

  const avatarLocalFilePath = req.file?.path;
  if (!avatarLocalFilePath) {
    throw new ApiError(400, "Avatar File Not Found");
  }

  const avatarCloudUpload = await uploadOnCloudinary(avatarLocalFilePath);
  if (!avatarCloudUpload) {
    throw new ApiError(500, "File Upload On Cloud failed");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const oldAvatarPublicId = user.avatar?.public_id;

  user.avatar = {
    url: avatarCloudUpload.url,
    public_id: avatarCloudUpload.public_id,
  };

  try {
    await user.save();
  } catch (error) {
    await deleteFromCloudinary(avatarCloudUpload.public_id, "image");
    throw new ApiError(500, "Database update failed. Image update reverted.");
  }

  if (oldAvatarPublicId && oldAvatarPublicId !== DEFAULT_AVATAR.public_id) {
    await deleteFromCloudinary(oldAvatarPublicId, "image");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Successfully Updated User's Avatar"));
});

//Checked
const handleGetUserReq = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.user?._id)) {
    throw new ApiError(400, "Invalid userId");
  }

  const { username } = req.body;

  if (inputValidate([username])) {
    throw new ApiError(400, "No Username");
  }

  const user = await User.find({ username });

  console.log(user);

  if (user.length === 0) {
    throw new ApiError(500, `No user with username :  ${username} found`);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, user[0], `user with username :  ${username} found`),
    );
});

//Checked
const handleGetCurrentUserReq = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.user?._id)) {
    throw new ApiError(401, "Not authenticated");
  }

  // req.user is already populated by verifyJWT (password & refreshToken excluded)
  return res
    .status(200)
    .json(new ApiResponse(200, { loggedInUser: req.user }, "Session valid"));
});

export {
  handleUserSignUpReq,
  handleSignInReq,
  handleSignOutReq,
  handleAccountUpdateReq,
  handleChangeEmailReq,
  handleChangePasswordReq,
  handleAvatarUpdateReq,
  handleGetUserReq,
  handleGetCurrentUserReq,
  handleGitHubOAuthCallback,
  handleUserSignUpReqWithGitHub,
};
