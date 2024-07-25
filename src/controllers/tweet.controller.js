import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body.content;
  if (!content.trim()) {
    throw new ApiError(400, "Content can't be empty");
  }
  const tweet = await Tweet.create({
    owner: req.user?._id,
    content: content,
  });
  if (!tweet) {
    throw new ApiError(500, "Error while tweeting");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
});

const updateTweet = asyncHandler(async (req, res) => {
  const tweetID = req.params;
  const { content } = req.body;
  if (!tweetID) {
    throw new ApiError(500, "Tweet id can't be empty");
  }
  const updateTweet = await Tweet.findByIdAndUpdate(tweetID, {
    $set: {
      content: content,
    },
  });
  if (!updateTweet) {
    throw new ApiError(500, "Error  while updating tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updateTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
