const express =  require("express");
const {
    forgotPassword,
    loginUser,
    refreshToken,
    registerUser,
    resetPassword,
    otpValid,
    updatePassword,
    getUser,
    resetPasswordLink,
    EmailActivationLink,
    activateEmail,
    logout
} = require("../../controllers/auth.controller");
require("./../../util/passport-setup");
const passport = require("passport");
const app = express();
app.use(passport.initialize());
app.use(passport.session());

/**
 * Endpoint: /api/v1/auth
 */
const router = express.Router();


router.route("/refresh-token").get(refreshToken);

// User
router.route("/get-user").get(getUser);
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").patch(resetPassword)
router.route("/reset-password").post(resetPasswordLink)
router.route("/otp-verify").post(otpValid); 
router.route("/update-password").patch(updatePassword);
router.route("/activate-email").post(EmailActivationLink)
router.route("/activate-email/:token").get(activateEmail)
router.route("/logout").get(logout)
    
// Oauth
router.get("/failed",(req,res)=>res.json("failed to login"));
router.get('/google',passport.authenticate('google',{scope:['profile','email']}));
router.get('/google/callback',passport.authenticate("google",{failureRedirect:'/auth/failed'}));



module.exports = router;
