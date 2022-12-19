const authController = require("../controllers/authController");
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/authMiddleware");


const {
  signIn,
  signUp,
  forgotPasswordController,
  resetPasswordController,
  logout,
  deleteUser,
} = authController;

router.post("/signup", signUp);

router.post("/signin", signIn);

router.post("/logout/:id", auth, logout);
router.delete("/delete", auth, deleteUser);

router
  .route("/forgotpassword")
  .put(forgotPasswordController)
router.post("/reset-password/:token", resetPasswordController);

module.exports = router;
