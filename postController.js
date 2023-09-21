const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Post = require("../model/postModel");
const User = require("./../model/userModel");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");

cloudinary.config({
  cloud_name: "dwjot1zhy",
  api_key: "562937548765246",
  api_secret: "XlZxwlVoZndfWq3OUNP58rpHXZM",
});

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "data");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${req.user._id}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not a Photo please upload only photos"));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPostPhoto = upload.single("photo");

// ADD POST
exports.addPost = catchAsync(async (req, res, next) => {
  const obj = {
    ...req.body,
    user: req.user._id,
  };
  if (req.file) {
    const photo = await cloudinary.uploader.upload(`data/${req.file.filename}`);
    obj.photo = photo.secure_url;
  }
  let post = await Post.create(obj);

  post = { ...post._doc, user: req.user };

  res.status(200).json({
    status: "success",
    data: {
      data: post,
    },
  });
});

// ADD LIKE TO A POST
exports.addLikeToPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  Post.findByIdAndUpdate(
    id,
    { $inc: { likes: 1 } }, // Increment the likes field by 1
    { new: true }
  )
    .then((post) => {
      if (!post) {
        res.status(404).json({ message: "No post found with that ID" });
      } else {
        res.json(post);
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

// ADD COMMENT TO A POST
exports.addCommentToPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { text, user } = req.body;

  const comment = { text, user };

  Post.findByIdAndUpdate(
    id,
    { $push: { comments: comment } }, // Add the comment to the comments array
    { new: true }
  )
    .then((post) => {
      if (!post) {
        res.status(404).json({ message: "No post found with that ID" });
      } else {
        res.json(post);
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

// DELETE POST
exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) {
    return next(new AppError("No post found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

// UPDATE POST
exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!post) {
    return next(new AppError("No post found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: post,
    },
  });
});

// GET SPECIFIC POST
exports.getSpecificPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError("No post found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: post,
    },
  });
});

// GET ALL POSTS
exports.getPosts = catchAsync(async (req, res, next) => {
  const filter = {};

  if (req.params.username) {
    const user = await User.findOne({ username: req.params.username });
    filter.user = user._id;
  }

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find(filter)
    .sort({
      _id: -1,
    })
    .sort("-createdAt")
    .skip(skip)
    .limit(limit)
    .populate({ path: "user" });

  res.status(200).json({
    status: "success",
    results: posts.length,
    data: {
      data: posts,
    },
  });
});

/* 
exports.getUserTweets = catchAsync(async (req, res, next) => {
  const filter = {};

  const user = await User.findOne({ username: req.params.username });
  filter.user = user._id;

  const tweets = await Tweet.find(filter).sort({
    _id: -1,
  });
  res.status(200).json({
    status: "success",
    result: tweets.length,
    tweets,
  });
});


 */
