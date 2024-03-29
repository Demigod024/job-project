const express = require("express");
const UserController = require("../controllers/userController");
const { auth, checkUser } = require("../middleware/authMiddleware");
const app = express();

app.use(express.json());
const router = express.Router();

const { updateUser, getUser, getAllUsers, deleteUser } = UserController;

router.route("/user").get(auth, checkUser("admin"), getAllUsers).delete(auth, checkUser("admin"), deleteUser).patch(auth, updateUser);

router.route("/profilepage").get(auth, getUser);

module.exports = router;




