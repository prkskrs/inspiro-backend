const express = require("express");
const {
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
} = require("../../controllers/user.controller");
const upload = require("../../middleware/fileUpload");

/**
 * Endpoint: /api/v1/user
 */

const router = express.Router();

router.route("/admin").get(getAllUser);

router.route("/:id").get(getUser).delete(deleteUser);
router.route("/update").post(UpdateUser);
router
  .route("/profile-upload/:id")
  .post(upload.fields([{ name: "avatar" }]), uploadAvatar);

router.route("/password/update").post(changePassword);

// like and save
router.route("/like/:id").put(likeWebsite);

router.route("/allLikedWebsites/:userId").get(getAllLikedWebsites);

router.route("/save/:id").put(saveWebsite);

router.route("/allSavedWebsites/:userId").get(getAllSavedWebsites);

router.route("/preferences").post(preferences);

router.route("/getUserCsv/:adminId").get(getAllUserCsv);

module.exports = router;
