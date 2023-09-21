const express = require("express");
const router = express.Router();
const postController = require("./../controller/postController");
const authController = require("../controller/authController");
const {
  uploadPostPhoto,
  addPost,
  deletePost,
  updatePost,
  getPosts,
  getSpecificPost,
  addLikeToPost,
  addCommentToPost,
} = postController;

const { register, login, forgotPassword, resetPassword, protect } =
  authController;

router.post("/register", register);
router.post("/login", login);
router.patch("/forgotPassword", forgotPassword);
router.post("/resetPassword/:token", resetPassword);

router.route("/").post(protect, uploadPostPhoto, addPost);
router.route("/getPosts").get(getPosts);
router.route("/:id/like").post(protect, addLikeToPost);
router.route("/:id/comment").post(protect, addCommentToPost);
router
  .route("/:id")
  .get(protect, getSpecificPost)
  .patch(protect, updatePost)
  .delete(protect, deletePost);

module.exports = router;
