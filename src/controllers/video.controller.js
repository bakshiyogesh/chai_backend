import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {
  destroyCloudinaryImage,
  destroyCloudinaryVideo,
} from "../../utils/Cloudinary.service.js";
const idCheckerForVideo = (videoID) => {
  if (!videoID) {
    throw new ApiError(400, "No video id found to be update");
  }
};
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const coverVideoLocalPath = req.files?.videofile[0]?.path;
  const thumbnailVideoLocalPath = req.files?.thumbnail[0]?.path;
  if (!(coverVideoLocalPath || thumbnailVideoLocalPath)) {
    throw new ApiError(400, "Thumbmnail or Video File Not Selected");
  }
  if (!(title.trim() || description.trim())) {
    throw new ApiError(400, "Video title or Description Can't be empty");
  }

  const VideoUploadPath = await uploadOnCloudinary(coverVideoLocalPath);
  const thumbnailPath = await uploadOnCloudinary(coverVideoLocalPath);
  if (!VideoUploadPath.url) {
    throw new ApiError(500, "Error while uploading video");
  } else if (!thumbnailPath.url) {
    throw new ApiError(500, "Error while uploading thumbnail");
  }
  const video = Video.create({
    title,
    description,
    video: VideoUploadPath,
    thumbnail: thumbnailPath,
    duration: VideoUploadPath.length,
    views: 0,
    isPublished: true,
    owner: req.user?._id,
  });
  if (!video) {
    throw new ApiError(500, "Error while uploading video in db");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Uploaded Successfully"));
  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  idCheckerForVideo(videoId);
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "No Video Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId, title, description } = req.params;
  const thumbnailVideoLocalPath = req.file?.thumbnail[0]?.path;
  if (!videoId) {
    throw new ApiError(400, "No video id found to be update");
  } else if (!thumbnailVideoLocalPath) {
    throw new ApiError(400, "Thumbmnail or Video File Not Selected");
  } else if (!(title.trim() || description.trim())) {
    throw new ApiError(400, "Video title or Description Can't be empty");
  }
  const thumbnailPath = await uploadOnCloudinary(coverVideoLocalPath);
  if (!thumbnailPath.url) {
    throw new ApiError(400, "Error while uploading thumbnail");
  }
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
        thumbnail: thumbnailPath.url,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Updated Successfully"));

  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "VideoId not found to delete");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video details not found");
  }
  await destroyCloudinaryImage(video.thumbnail);
  await destroyCloudinaryVideo(video.videoFile);
  const deletedVideo = await Video.findByIdAndDelete(videoId);
  if (!deletedVideo) {
    throw new ApiError(500, "Error while deleting the video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  idCheckerForVideo(videoId);
  const videoStatus = await Video.findById(videoId);
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !videoStatus.isPublished,
      },
    },
    {
      new: true,
    }
  );
  if (!video) {
    throw new ApiError(500, "Error while changing publish status");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Published Status updated successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
