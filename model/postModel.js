const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  text: String,
  photo: String,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Post must belong to a user."],
  },
  likes: {
    type: Number,
    default: 0,
  },
  comments: [
    {
      text: String,
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
postSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "username email",
  });
  next();
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
