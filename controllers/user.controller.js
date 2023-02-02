const asyncWrapper = require("../util/asyncWrapper");
const User = require("../model/User.js");
const { createCustomError } = require("../errors/customAPIError");
const APIFeatures = require("../util/APIfeature");
const { sendSuccessApiResponse } = require("../middleware/successApiResponse");
const cookieToken = require("../util/cookieToken.js");
const dotenv = require("dotenv");
const WebsiteMaster = require("../model/WebsiteMaster.js");
const { parse } = require("json2csv");
const fs = require("fs");

dotenv.config();

const getUser = asyncWrapper(async (req, res, next) => {
  const user = req.params.id;
  const isUser = await User.findById(user);
  if (!isUser) {
    return next(createCustomError(`${req.user.userId} Not Found`, 404));
  }
  const response = sendSuccessApiResponse(isUser);
  res.status(200).json(response);
});

const getAllUser = asyncWrapper(async (req, res, next) => {
  const SearchString = ["firstName", "lastName"];
  const isAdmin = await User.findById(req.user.userId);
  if (isAdmin.role != "Admin") {
    return next(createCustomError(`${req.user.userId} is not Admin`, 401));
  }
  const query = new APIFeatures(User.find({ isActive: true }), req.query)
    .filter()
    .page()
    .limit()
    .search(SearchString)
    .sort({ createdAt: 1 });

  const data = await query.query;
  const getCount = await User.countDocuments({ isActive: true });
  const response = sendSuccessApiResponse({ data, getCount });
  res.status(200).json(response);
});

const deleteUser = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;
  const isAdmin = await User.findById(req.user.userId);
  if (isAdmin.role != "Admin") {
    return next(createCustomError(`${req.user.userId} is not Admin`, 401));
  }
  const user = await User.findById(id);
  user.isActive = false;
  await user.save();
  await user.remove();
  const response = sendSuccessApiResponse(user);
  res.status(200).json(response);
});

const UpdateUser = asyncWrapper(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    role,
    webURL,
    location,
    isActive,
    sendNewsletter,
    canSubmit,
    profiles,
  } = req.body;
  const userId = req.user.userId;
  const isUser = await User.findById(userId);

  // console.log(userId)
  if (
    userId.toString() != req.user.userId.toString() &&
    isUser.role !== "Admin"
  ) {
    return next(createCustomError(`${req.user.userId} is not Authorized`, 401));
  }
  await User.findByIdAndUpdate(userId, {
    firstName: firstName,
    lastName: lastName,
    email: email,
    role: role,
    webURL: webURL,
    location: location,
    isActive: isActive,
    sendNewsletter: sendNewsletter,
    canSubmit: canSubmit,
    profiles: profiles,
  });
  const data = await User.findById(userId);
  const response = sendSuccessApiResponse(data);
  res.status(200).json(response);
});

const uploadAvatar = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;
  let filename = req.files;
  if (filename) {
    await User.findByIdAndUpdate(id, {
      avatar: "/public/WebsiteSS/" + filename.avatar[0].originalname,
    });
    const user = await User.findById(id);
    const response = sendSuccessApiResponse(user);
    res.status(200).json(response);
  } else {
    return next(createCustomError("Could Not upload", 402));
  }
});

// User Profile Settings

const changePassword = asyncWrapper(async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("+password");
    const isCorrectPassword = await user.comparePassword(
      req.body.oldPassword,
      user.password
    );

    if (!isCorrectPassword) {
      return res.status(400).json({
        success: "false",
        message: "oldpassword is incorrect!",
      });
    }

    if (req.body.newPassword === req.body.confirmPassword) {
      user.password = req.body.newPassword;
      // console.log(user.password)
      await user.save();
      const token = user.generateJWT();
      const options = {
        expires: new Date(
          Date.now() + process.env.COOKIE_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      };
      user.password = undefined;
      res.status(200).cookie("token", token, options).json({
        success: true,
        message: "Password Changed Successfully !",
        token,
        user,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "new password and confirm password doesnt matched",
      });
    }
  } catch (error) {
    next(createCustomError(error, 400));
  }
});

const likeWebsite = async (req, res, next) => {
  try {
    const webId = req.params.id;
    const website = await WebsiteMaster.findOne({ _id: webId });
    const userId = req.user.userId;
    const userFound = await User.findOne({ _id: userId });

    if (!userFound) {
      return res.status(500).json({
        success: false,
        message: "User not found !",
      });
    }
    // console.log(userFound.likedWebsites)
    if (userFound.likedWebsites.includes(webId)) {
      var index = userFound.likedWebsites.indexOf(webId);
      var removed = userFound.likedWebsites.splice(index, 1);
      await userFound.save();
      await website.likeCount--;
      await website.save();
      return res.status(200).json({
        success: true,
        message: "Disliked successfully",
        userFound: userFound,
        website: website.likeCount,
      });
    }
    userFound.likedWebsites.push(webId);
    userFound.save();
    await website.likeCount++;
    await website.save();
    return res.status(200).json({
      success: true,
      message: "Liked successfully",
      user: userFound,
      website: website.likeCount,
    });
  } catch (error) {
    next(createCustomError(error, 400));
  }
};

const getAllLikedWebsites = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.userId }).catch((err) => {
      console.log(`error getting user ${err}`);
      return null;
    });

    if (user === null) {
      return res.status(400).json({
        success: false,
        message: "User not found with this id",
      });
    }

    if (user.likedWebsites.length === 0) {
      return res.status(400).json({
        success: false,
        message: "you haven't liked any websites",
      });
    }

    const likedWebsites = await WebsiteMaster.find({
      _id: {
        $in: user.likedWebsites,
      },
    }).catch((err) => {
      console.log(`error getting liked websites :: ${err}`);
      return null;
    });

    if (likedWebsites === null) {
      return res.status(400).json({
        success: false,
        message: "No such websites exist",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Liked Websites",
      websites: likedWebsites,
    });
  } catch (error) {
    next(createCustomError(error, 400));
  }
};

const saveWebsite = async (req, res, next) => {
  try {
    const webId = req.params.id;
    const website = await WebsiteMaster.findOne({ _id: webId });
    const userId = req.user.userId;
    const userFound = await User.findOne({ _id: userId });

    if (!userFound) {
      return res.status(500).json({
        success: false,
        message: "User not found !",
      });
    }
    // console.log(userFound.likedWebsites)
    if (userFound.savedWebsites.includes(webId)) {
      var index = userFound.savedWebsites.indexOf(webId);
      var removed = userFound.savedWebsites.splice(index, 1);
      await userFound.save();
      await website.saveCount--;
      await website.save();
      return res.status(200).json({
        success: true,
        message: "Unsaved successfully",
        userFound: userFound,
        website: website.saveCount,
      });
    }
    userFound.savedWebsites.push(webId);
    userFound.save();
    await website.saveCount++;
    await website.save();
    return res.status(200).json({
      success: true,
      message: "Saved successfully",
      user: userFound,
      website: website.saveCount,
    });
  } catch (error) {
    next(createCustomError(error, 400));
  }
};

const getAllSavedWebsites = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.userId }).catch((err) => {
      console.log(`error getting user ${err}`);
      return null;
    });

    if (user === null) {
      return res.status(400).json({
        success: false,
        message: "User not found with this id",
      });
    }

    if (user.savedWebsites.length === 0) {
      return res.status(400).json({
        success: false,
        message: "you haven't saved any websites",
      });
    }

    const savedWebsites = await WebsiteMaster.find({
      _id: {
        $in: user.savedWebsites,
      },
    }).catch((err) => {
      console.log(`error getting saved websites :: ${err}`);
      return null;
    });

    if (savedWebsites === null) {
      return res.status(400).json({
        success: false,
        message: "No such websites exist",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Saved Websites",
      websites: savedWebsites,
    });
  } catch (error) {
    next(createCustomError(error, 400));
  }
};

const getAllUserCsv = asyncWrapper(async (req, res, next) => {
  try {
    const adminId = req.params.adminId;
    const uId = req.user.userId;
    console.log(adminId);
    console.log(uId);
    if (uId !== adminId) {
      return res.status(400).json({
        success: false,
        message: "You don't have access for this feature.",
      });
    }
    const isAdmin = await User.findById(adminId)
      .lean()
      .catch((err) => {
        console.log(`no admin found with this id :: ${err}`);
        return null;
      });

    if (isAdmin === null) {
      return res.status(400).json({
        success: false,
        message: "No admin found with this id!",
      });
    }

    if (isAdmin.role != "Admin") {
      return res.status(400).json({
        success: false,
        message: `${admin.firstName} is not an Admin.`,
      });
    }

    const users = await User.find({}).catch((err) => {
      console.log(`error getting users :: ${err}`);
      return null;
    });

    if (users === null) {
      return res.status(400).json({
        success: false,
        message: "No users found.",
      });
    }

    const fields = ["firstName", "lastName"];
    const opts = { fields };
    try {
      const csv = parse(users, opts);
      fs.writeFile("users1.csv", csv, function (error) {
        if (error) {
          throw error;
        }
        console.log("Write Successfully!");
      });
      return res.status(200).json({
        success: true,
        message: "Write Successfully!",
      });
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    next(createCustomError(error, 400));
  }
});

const preferences = asyncWrapper(async (req, res, next) => {
  try {
    const uId = req.user.userId;
    const user = await User.findOne({ _id: uId })
      .lean()
      .catch((err) => {
        console.log(`error getting user ${err}`);
        return null;
      });

    if (user === null) {
      return res.status(400).json({
        success: false,
        message: "No user found",
      });
    }
    const { lookingFor, interests, definition, primaryPurpose } = req.body;
    const pref = [lookingFor, interests, definition, primaryPurpose];
    const updateUser = await User.findByIdAndUpdate(
      uId,
      {
        preferences: pref,
      },
      { new: true, runValidators: true, useFindAndModify: false }
    );
    // console.log(updateUser);

    return res.status(200).json({
      success: true,
      message: "Preference added sucessfully!",
      preferences: pref,
    });
  } catch (error) {
    next(createCustomError(error, 400));
  }
});

module.exports = {
  getAllUser,
  UpdateUser,
  getUser,
  uploadAvatar,
  deleteUser,
  changePassword,
  likeWebsite,
  getAllLikedWebsites,
  saveWebsite,
  getAllSavedWebsites,
  getAllUserCsv,
  preferences,
};
