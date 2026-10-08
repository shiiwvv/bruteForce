import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Problem } from "../models/problem.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { inputValidate } from "../utils/inputValidation.js"
import mongoose, { isValidObjectId } from "mongoose";
import { capitalizeInitialsInString } from "../utils/capitalizeInitialsInString.js";
import { isValidISOString } from "../utils/checkISOString.js"

//Checked
const handleUploadProblemReq = asyncHandler(async (req, res) => {
    const userId = String(req.user?._id);
    if (!isValidObjectId(userId)) { 
        throw new ApiError(400, "Invalid UserId");
    }

    let { title, platform, topic, difficulty, time, notes, ISOString, link } = req.body;

    if (inputValidate([title, platform, topic, difficulty, ISOString, link])) {
        throw new ApiError(400, "Title , Platform , Topic , Difficulty, ISOString required");
    }

    if (!isValidISOString(ISOString)) {
        throw new ApiError(400, "Invalid ISOString");
    }

    const userDateObj = new Date(ISOString);
    userDateObj.setHours(0, 0, 0, 0);

    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    if (userDateObj.getTime() < todayObj.getTime()) {
        throw new ApiError(400, "Can't set reminder for a previous date...");
    }

    const problemAlreadyExist = await Problem.find({ title, platform, owner: userId });

    if (problemAlreadyExist.length !== 0) {
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                problemAlreadyExist,
                "Problem Already Existed",
            ));
    }

    title = capitalizeInitialsInString(title);
    platform = capitalizeInitialsInString(platform);
    topic = capitalizeInitialsInString(topic);
    difficulty = capitalizeInitialsInString(difficulty);


    const createProblem = await Problem.create({
        title,
        platform,
        difficulty,
        topic,
        time: time ? time : null,
        notes: notes ? notes : null,
        reminderTime: ISOString,
        solved: false,
        owner: userId,
        link,
    });

    if (!createProblem) {
        throw new ApiError(500, "Failed to Store the Problem in DB");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            createProblem,
            "Successfully saved Users Problem",
        ));
});

//Checked
const handleUpdateLastDateReq = asyncHandler(async (req, res) => {
    const userId = String(req.user?._id);
    if (!isValidObjectId(req.user?._id)) {
        throw new ApiError(400, "Invalid userId");
    }

    const { ISOString } = req.body;
    const { problemId } = req.params;

    if (!isValidObjectId(problemId)) {
        throw new ApiError(400, "Invalid problemId");
    }

    const userDate = ISOString.split("T");
    const serverDate = new Date().toISOString().split("T");

    if (userDate[0] < serverDate[0]) {
        throw new ApiError(400, "Can't set reminder for a previous date...");
    }

    const problem = await Problem.findOneAndUpdate(
        { _id: problemId, owner: userId },
        {
            reminderTime: ISOString,
        },
        { returnDocument: 'after' }
    );

    if (!problem) {
        throw new ApiError(500, "Failed to update the ISOString");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            problem,
            "Successfully saved the new date",
        ));
});

//Checked
const handleMarkProblemReq = asyncHandler(async (req, res) => {
    const userId = String(req.user?._id);
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid UserId");
    }

    const { problemId } = req.params;
    if (inputValidate([problemId])) {
        throw new ApiError(400, "Missing ProblemId");
    }
    if (!isValidObjectId(problemId)) {
        throw new ApiError(400, "Invalid problemId");
    }

    const problem = await Problem.findOne({ _id: problemId, owner: userId })

    if (!problem) {
        throw new ApiError(500, `Problem with ${problemId} doesn't exist`);
    }

    problem.solved = !problem.solved;

    await problem.save();

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            problem,
            "Problem Solved Field Updates",
        ));
});

//Checked
const handleUpdateProblem = asyncHandler(async (req, res) => {
    const { problemId } = req.params;
    const userId = String(req.user?._id);
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid UserId");
    }
    if (!isValidObjectId(problemId)) {
        throw new ApiError(400, "Invalid problemId");
    }

    let { title, platform, topic, difficulty, time, notes } = req.body;

    title = title ? capitalizeInitialsInString(title) : null;
    platform = platform ? capitalizeInitialsInString(platform) : null;
    topic = topic ? capitalizeInitialsInString(topic) : null;
    difficulty = difficulty ? capitalizeInitialsInString(difficulty) : null;

    const user = await Problem.findOne({ _id: problemId, owner: userId })

    if (!user) {
        throw new ApiError(500, "Failed to Fetch the user object");
    }

    if (title) {
        user.title = title;
    }
    if (platform) {
        user.platform = platform;
    }
    if (topic) {
        user.topic = topic;
    }
    if (difficulty) {
        user.difficulty = difficulty;
    }
    if (time) {
        user.time = time;
    }
    if (notes) {
        user.notes = notes;
    }

    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            user,
            "Successfully updated problem details",
        ));
});

//Checked
const handleDeleteProblem = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }


    const { problemId } = req.params;

    if (!isValidObjectId(problemId)) {
        throw new ApiError(400, "Invalid problemId");
    }

    const problem = await Problem.findOneAndDelete({ _id: problemId, owner: userId })


    return res
        .status(200)
        .json(new ApiResponse(
            200,
            problem,
            "Deleted Successfuly",
        ));
});

//Checked
const handleGetAllProblemsReq = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.user?._id)) {
        throw new ApiError(400, "Invalid userId");
    }

    const userId = String(req.user?._id);

    const problems = await Problem.find({ owner: userId }).select(" -owner -lastRemindedAt");
    console.log(problems);

    if (problems.length === 0) {
        throw new ApiError(404, "No Problems Found, Log One To View");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            problems,
            "SuccessFully Fetched all the user Problems"
        ));
})

//Checked
const handleGetParticularProblem = asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.user?._id)) {
        throw new ApiError(400, "Incorrect userId");
    }

    let { title } = req.query;
    if (!title) {
        throw new ApiError(400, "Title query parameter is required");
    }

    title = capitalizeInitialsInString(title);

    const problem = await Problem.find({ title });

    if (!problem) {
        throw new ApiError(500, "No Problem With Such Title Found");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            problem,
            `Problem with title ${title} found`,
        ));
});

export { handleUploadProblemReq, handleMarkProblemReq, handleUpdateProblem, handleUpdateLastDateReq, handleDeleteProblem, handleGetAllProblemsReq, handleGetParticularProblem }; 