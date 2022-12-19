const express = require("express");
const UserJob = require("../models/userJobModel");
const QueryObj = require("../helpers/query");
const Job = require("../models/jobModel");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");

exports.applyJob = async (req, res) => {
  try {

    const user = req.user;
    const userID = user._id
    if (!userID) {
      return res
        .status(401)
        .json({ success: false, message: "verify signin to apply" });
    }

    const { jobId, resume } = req.body;
    const jobToReturn = await Job.findById(jobId)


    if (!jobToReturn) {
      return res.status(404).json({
        status: false,
        message: "job application has stopped."
      })
    };


    const userJobCheck = await UserJob.findOne({ userId: userID, jobId: jobId })
    if (userJobCheck) {
      return res.status(400).json({
        status: false,
        message: "User already applied"
      })
    };



    const findEmployer = await User.findById(jobToReturn.employerId)

    const userjob = await UserJob.create({
      userId: userID,
      jobId: jobId,
      resume
    });


    let mail = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.HOST_EMAIL,
        pass: process.env.EMAIL_PASS
      }
    });

    let mailOptions = {
      from: process.env.HOST_EMAIL,
      to: findEmployer.email,
      subject: "Job application update",
      text: `Job applicant ${user.name} has applied for ${jobToReturn.title} with resume ${userjob.resume} and application ID ${userjob._id}`
    }

    mail.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent : ' + info.response);
      }
    })


    return res.status(201).json({
      status: true,
      message: `You have successfully applied for ${jobToReturn.title} at ${jobToReturn.organisation}`,
      data: {
        userjob,
      },
    });
  } catch (err) {
    res.status(404).json(err.message);
  }
};





exports.updateUserJob = async (req, res) => {
  try {

    const id = req.params.id;
    const user = req.user;
    const userID = user._id
    if (!userID) {
      return res
        .status(401)
        .json({ success: false, message: "unauthorized user" });
    };


    const filter = { _id: id }
    const update = { status: req.body.status }

    const checkUserJob = await UserJob.findOne(filter)

    if (!checkUserJob) {
      return res.status(404).send({
        status: false,
        message: "application not found"
      })
    }

    const findUserJob = await UserJob.findOneAndUpdate(filter, update, {
      new: true
    });

    let newUser = await User.findById(findUserJob.userId)
    const jobToReturn = await Job.findById(findUserJob.jobId)

    if (findUserJob.status.includes("shortlisted")) {
      let mail = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.HOST_EMAIL,
          pass: process.env.EMAIL_PASS
        }
      });

      let mailOptions = {
        from: process.env.HOST_EMAIL,
        to: newUser.email,
        subject: `Update on ${jobToReturn.title} application`,
        text: `Congratulations ${findUserJob._id} have been shortlisted at ${jobToReturn.organisation}`
      }

      mail.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent : ' + info.response);
        }
      })
    };

    if (findUserJob.status.includes("rejected")) {
      let mail = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.HOST_EMAIL,
          pass: process.env.EMAIL_PASS
        }
      });

      let mailOptions = {
        from: process.env.HOST_EMAIL,
        to: newUser.email,
        subject: `Update on ${jobToReturn.title} application`,
        text: `application with ID ${findUserJob._id}  was not selected`
      }

      mail.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent : ' + info.response);
        }
      })
    };

    return res.status(200).send({
      status: true,
      message: "job status has been updated successfully",
      updatedJob: findUserJob,
    });



  } catch (err) {
    const error = ErrorHandler.handleErrors(err);
    res.status(404).json({ error });
  }
};





exports.getUserJob = async (req, res) => {
  try {

    const id = req.params.id;
    const user = req.user
    const userID = user._id
    if (!userID) {
      return response
        .status(401)
        .json({ success: false, message: "unauthorized user" });
    }


    if (user.role.includes("admin")) {
      return response.status(403).json({
        status: false,
        message: "not allowed"
      })
    }

    const findOneUserJob = await UserJob.findById(id);
    if (!findOneUserJob) {
      return res.status(404).json({
        status: false,
        message: "Application not found",
      });
    } else {
      return res.status(200).json({
        status: true,
        message: "Application found",
        appliedjob: findOneUserJob,
      });
    }
  } catch (error) {
    return res.status(400).json(error.message);
  }
};





exports.getAllUserJobs = async (req, res) => {
  try {

    const user = req.user
    const userID = user._id
    if (!userID) {
      return res
        .status(401)
        .json({ success: false, message: "unauthorized user" });
    }

    let queriedUserJobs = new QueryObj(UserJob.find(), req.query)
      .sort()
      .filter()
      .limit()
      .paginate();
    let userJobs = await queriedUserJobs.query;
    res.status(200).json({
      status: true,
      message: "UserJobs found",
      count: userJobs.length,
      applications: userJobs,
    });

  } catch (err) {
    return res.status(404).send({
      status: false,
      message: "No Userjobs found",
    });
  }
};

exports.deleteUserJob = async (request, response) => {
  try {

    const user = request.user
    const userId = user._id
    if (!userId) {
      return response
        .status(401)
        .json({ success: false, message: "unauthorized user" });
    }

    const { id } = request.query;
    const findUserJob = await UserJob.findByIdAndDelete(id);
    if (findUserJob) {
      return response.status(204).send({
        status: true,
        message: " deleted successfully"
      });
    } else {
      return response.status(404).send({
        status: false,
        message: "job not found",
      });
    }
  } catch (error) {
    return response.status(400).json({ error })
  };
};



