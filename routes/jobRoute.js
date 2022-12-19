const express = require("express");
const app = express();
const JobController = require("../controllers/jobController");
const { auth, checkUser } = require("../middleware/authMiddleware");

app.use(express.json());
const router = express.Router();

const { createJob, updateJob, getJob, getJobListing, deleteJob, recommendAJob } = JobController;



router.route("/job").post(auth, checkUser("employer"), createJob).get(getJobListing).delete(auth, checkUser("employer"), deleteJob);
router.route("/job/:id").get(getJob).put(auth, checkUser("employer"), updateJob);
router.route("/recommendjob").get(auth, recommendAJob);



module.exports = router;