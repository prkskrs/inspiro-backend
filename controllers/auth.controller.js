const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const express = require("express");
const otpGenrator = require("otp-generator");
const jwt = require("jsonwebtoken");
const { createCustomError } = require("../errors/customAPIError");
const { sendSuccessApiResponse } = require("../middleware/successApiResponse");
const Otp = require("../model/Otp");
const User = require("../model/User");
const sendEmail = require("../util/email");
const asyncWrapper = require("../util/asyncWrapper");

const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
};

const refreshToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    const message = "Unauthenticaded No Bearer";
    return next(createCustomError(message, 401));
  }

  let data;
  const token = authHeader.split(" ")[1];
  console.log(token);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    data = await getNewToken(payload);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      const payload = jwt.decode(token, { complete: true }).payload;
      data = await getNewToken(payload);

      if (!data) {
        const message = "Authentication failed invalid JWT";
        return next(createCustomError(message, 401));
      }
    } else {
      const message = "Authentication failed invalid JWT";
      return next(createCustomError(message, 401));
    }
  }

  res.status(200).json(sendSuccessApiResponse(data, 200));
};

const getUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    const message = "Unauthenticaded No Bearer";
    return next(createCustomError(message, 401));
  }

  let data;
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    data = user;
  } catch (error) {
    const message = "Authentication failed invalid JWT";
    return next(createCustomError(message, 401));
  }

  res.status(200).json(sendSuccessApiResponse(data, 200));
};

const getNewToken = async (payload) => {
  const isUser = payload?.userId ? true : false;

  let data;
  if (isUser) {
    const user = await User.findOne({ isActive: true, _id: payload.userId });
    if (user) {
      data = { token: user.generateJWT() };
    }
  }
  return data;
};

const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, gender, role } =
      req.body;

    const toStore = {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      gender,
      role,
    };

    const emailisActive = await User.findOne({
      email,
      isActive: true,
      isVerified: true,
    });
    if (emailisActive) {
      const message = "Email is already registered";
      return next(createCustomError(message, 406));
    }
    console.log(1);
    console.log(2);
    const OTPgen = otpGenrator.generate(5, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    console.log(3);
    const OTP = await Otp.updateOne(
      { email: email },
      { email: email, otp: OTPgen },
      { upsert: true }
    );
    await sendEmail({
      email: email,
      subject: "Your OTP (Valid for 5 minutes)",
      message: `Your One Time Password is ${OTPgen}`,
    });
    console.log(4);
    const notVerifiedUser = await User.find({ email: email });
    if (notVerifiedUser.length) {
      console.log(6);
      res.status(200).json(sendSuccessApiResponse(notVerifiedUser, 200));
    } else {
      const user = await User.create(toStore);
      console.log(user);
      res.status(201).json(user);
    }
  } catch (err) {
    return createCustomError(err, 400);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const emailExists = await User.findOne(
      { email, isActive: true, isVerified: true },
      "firstName lastName email username password role"
    );
    if (!emailExists) {
      const message = "Invalid credentials";
      return next(createCustomError(message, 401));
    }

    const isPasswordRight = await emailExists.comparePassword(password);
    if (!isPasswordRight) {
      const message = "Invalid credentials";
      return next(createCustomError(message, 401));
    }

    const data = {
      firstName: emailExists.firstName,
      lastName: emailExists.lastName,
      email: emailExists.email,
      token: emailExists.generateJWT(),
    };

    res.status(200).json(sendSuccessApiResponse(data));
  } catch (err) {
    return createCustomError(err, 400);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({
      email,
      isActive: true,
      isVerified: true,
    });
    if (!user) {
      const message = `No user found with the email: ${email}`;
      return next(createCustomError(message, 400));
    }
    const OTPgen = otpGenrator.generate(5, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    const OTP = await Otp.updateOne(
      { email: email },
      { email: email, otp: OTPgen },
      { upsert: true }
    );
    await sendEmail({
      email: email,
      subject: "Your OTP (Valid for 5 minutes)",
      message: `Your One Time Password is ${OTPgen}`,
    });
    res.status(200).json("OTP send");
  } catch (err) {
    return createCustomError(err, 400);
  }
};

const otpValid = async (req, res, next) => {
  try {
    const { otp, email } = req.body;
    const verify = await Otp.findOne({ email: email, otp: otp });
    if (!verify) {
      const message = "Invalid token or Token expired";
      return next(createCustomError(message));
    }

    const user = await User.findOneAndUpdate(
      { email: email },
      { isVerified: true }
    );
    const data = { user, token: user.generateJWT() };
    const response = sendSuccessApiResponse(data);
    res.status(200).json(response);
  } catch (err) {
    return createCustomError(err, 400);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });
    console.log(user);
    if (!user) {
      const message = "No User exist";
      return next(createCustomError(message));
    }
    const payload = await jwt.verify(
      user.passwordResetToken,
      process.env.JWT_SECRET
    );
    console.log(payload);
    console.log(payload.email);
    // const reset = await User.findOne({_id:user.id,passwordResetToken:token,passwordResetExpires: { $gt: Date.now() }})
    if (payload.userId != user._id) {
      const message = "Invalid token or Session expired";
      return next(createCustomError(message));
    }
    user.password = password;
    await user.save();
    res.json({
      message: "Password changed successfully",
      token: user.generateJWT(),
    });
  } catch (err) {
    return createCustomError(err, 400);
  }
};

const resetPasswordLink = asyncWrapper(async (req, res, next) => {
  const email = req.body.email;
  const user = await User.findOne({ email: email, isActive: true });
  if (!user) {
    const message = `No user found with the email: ${email}`;
    return next(createCustomError(message, 400));
  }
  try {
    const resetToken = user.generateJWT();
    const resetURL = `${req.protocol}://${process.env.URL}/api/v1/auth/reset-password/${resetToken}`;
    const message = `Forgot your password? Submit a request with your new password to \n ${resetURL}`;
    await sendEmail({
      email: email,
      subject: "Your password reset token (Valid for 10 minutes)",
      message,
    });
    user.passwordResetToken = resetToken;
    await user.save();
    const response = sendSuccessApiResponse(resetURL);
    res.status(200).json(response);
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    return next(createCustomError(err));
  }
});
const EmailActivationLink = asyncWrapper(async (req, res, next) => {
  const id = req.body.id;
  const email = req.body.email;
  const isUser = await User.findById(id);
  const token = jwt.sign({ email: email, userId: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
  // const token = isUser.generateJWT()
  const resetURL = `${req.protocol}://${process.env.URL}/api/v1/auth/activate-email/${token}`;
  const message = `Click on below link to verify this email \n ${resetURL}`;
  await sendEmail({
    email: email,
    subject: "Your email activation link (Valid for 10 minutes)",
    message,
  });
  const response = sendSuccessApiResponse(resetURL);
  res.status(200).json(response);
});
const activateEmail = asyncWrapper(async (req, res, next) => {
  const token = req.params.token;
  const payload = await jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({
    isActive: true,
    _id: payload.userId,
    isVerified: true,
  });
  if (!user) {
    return next(createCustomError("Invalid Token"));
  }
  user.email = payload.email;
  await user.save();
  const response = sendSuccessApiResponse(user);
  res.status(200).json(response);
});
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const id = req.body.id;
    console.log(id);
    const user = await User.findOne({
      _id: id,
      isActive: true,
      isVerified: true,
    });
    if (!user) {
      const message = "There was an error finding the email";
      return next(createCustomError(message, 401));
    }

    const isCurrentPasswordCorrect = await user.comparePassword(
      currentPassword
    );
    if (!isCurrentPasswordCorrect) {
      const message = "Invalid current password";
      return next(createCustomError(message, 400));
    }

    user.password = newPassword;
    await user.save();

    const data = { updatedPassword: true, email: user.email };
    const response = sendSuccessApiResponse(data);
    res.status(200).json(response);
  } catch (err) {
    return createCustomError(err, 400);
  }
};

const logout = asyncWrapper(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "loggedOut Successfully",
  });
});

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  otpValid,
  updatePassword,
  refreshToken,
  getUser,
  resetPasswordLink,
  EmailActivationLink,
  activateEmail,
  logout,
};
