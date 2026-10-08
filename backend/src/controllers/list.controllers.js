import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { List } from "../models/list.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { inputValidate } from "../utils/inputValidation.js"
import mongoose, { isValidObjectId } from "mongoose";
import { capitalizeInitialsInString } from "../utils/capitalizeInitialsInString.js";
import { Problem } from "../models/problem.model.js";


const handleCreateListReq = asyncHandler(async (req, res) => {
    console.log("handleCreateListReq called");
    const userId = String(req.user?._id);
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "user not logged in");
    }

    let { title, description, problemId } = req.body;

    console.log("title : ", title);
    console.log("description : ", description);
    console.log("problemId : ", problemId);

    if (inputValidate([title])) {
        throw new ApiError(400, "title and description requried");
    }

    const initialList = problemId ? [problemId] : [];

    title = capitalizeInitialsInString(title);

    const list = await List.create({
        title,
        description: description ? description : "",
        owner: userId,
        problems: initialList
    });

    console.log("list: ", list);

    if (!list) {
        throw new ApiError(500, "failed to create playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            list,
            `${title} list is created successfully`,
        ));
});

// FIX: Added missing handleAddProblemToListReq handler (single problem add)
const handleAddProblemToListReq = asyncHandler(async (req, res) => {
    const userId = String(req.user?._id);
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    // FIX: Properly destructure params instead of assigning entire req.params object
    const { listId, problemId } = req.params;

    if (!isValidObjectId(listId)) {
        throw new ApiError(400, "Invalid listId");
    }
    if (!isValidObjectId(problemId)) {
        throw new ApiError(400, "Invalid problemId");
    }

    // FIX: Push the ObjectId directly, not a wrapped object { problem }
    const updatedList = await List.findOneAndUpdate(
        { owner: userId, _id: listId },
        { $push: { problems: problemId } },
        { returnDocument: 'after' }
    );

    if (!updatedList) {
        throw new ApiError(500, "Failed to Update the list");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedList,
            "Problem Added to the list successfully"
        ));
});

const handleAddMultipleProblemToListReq = asyncHandler(async (req, res) => {
    const userId = String(req.user?._id);
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    // FIX: Properly destructure params
    const { listId } = req.params;
    const { problemIds } = req.body;

    const problemsList = await Problem.find({ _id: { $in: problemIds } }).select("-time -notes -link -reminderTime -lastRemindedAt");

    if (problemsList.length === 0) {
        throw new ApiError(400, "Invalid problemId's");
    }

    const updatedList = await List.findOneAndUpdate(
        { owner: userId, _id: listId },
        {
            $addToSet: { problems: { $each: problemsList } }
        },
        {
            returnDocument: 'after'
        }
    );

    if (!updatedList) {
        throw new ApiError(500, "Failed to Update the list");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedList,
            "Problems Added to the list successfully"
        ));
});

const handleUpdateListReq = asyncHandler(async (req, res) => {
    const userId = String(req.user?._id);
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    // FIX: Properly destructure params
    const { listId } = req.params;
    const { title, description } = req.body;

    const updateObject = {
        title: title,
        description: description
    };

    if (!isValidObjectId(listId)) {
        throw new ApiError(400, "Invalid listId");
    }

    // FIX: Changed List.findByOneAndUpdate → List.findOneAndUpdate (typo fix)
    const updatedList = await List.findOneAndUpdate(
        { owner: userId, _id: listId },
        updateObject,
        { returnDocument: 'after' }
    );

    if (!updatedList) {
        throw new ApiError(500, "failed to update the list");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedList,
            "Successfully Updated the list",
        ));
});

const handleRemoveProblemFromListReq = asyncHandler(async (req, res) => {
    const userId = String(req.user?._id);
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    // FIX: Properly destructure params instead of assigning entire req.params object
    const { listId, problemId } = req.params;

    if (!isValidObjectId(listId)) {
        throw new ApiError(400, "Invalid listId");
    }
    if (!isValidObjectId(problemId)) {
        throw new ApiError(400, "Invalid problemId");
    }

    const updatedList = await List.findOneAndUpdate(
        { owner: userId, _id: listId },
        { $pull: { problems: problemId } },
        { returnDocument: 'after' },
    );

    if (!updatedList) {
        throw new ApiError(500, "failed to remove the problem from list");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedList,
            "Removed the list successfully",
        ));
});

const handleDeleteListReq = asyncHandler(async (req, res) => {
    const userId = String(req.user?._id);
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    // FIX: Properly destructure params
    const { listId } = req.params;

    if (!isValidObjectId(listId)) {
        throw new ApiError(400, "Invalid listId");
    }

    const deleteList = await List.findOneAndDelete({ owner: userId, _id: listId });
    if (!deleteList) {
        throw new ApiError(500, "failed to delete the playList");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Successfully Deleted the list",
        ));
});

const handleGetAllListReq = asyncHandler(async (req, res) => {
    const userId = String(req.user?._id);
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    const lists = await List.find({ owner: userId });

    // FIX: Removed the error throw on empty array — an empty list is valid for new users.
    // Return 200 with the empty array instead of throwing a 400 error.

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            lists,
            "Successfully Fetched all the Lists",
        ));
});

const handleGetParticularList = asyncHandler(async (req, res) => {
    const userId = String(req.user?._id);
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    // FIX: Properly destructure params
    const { listId } = req.params;

    if (!isValidObjectId(listId)) {
        throw new ApiError(400, "Invalid listId");
    }

    const list = await List.findOne({ owner: userId, _id: listId }).populate('problems');
    if (!list) {
        throw new ApiError(500, "Failed to Fetch the list");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            list,
            "Successfully fetched the requested List"
        ));
});

export { handleCreateListReq, handleAddProblemToListReq, handleAddMultipleProblemToListReq, handleUpdateListReq, handleDeleteListReq, handleRemoveProblemFromListReq, handleGetAllListReq, handleGetParticularList };