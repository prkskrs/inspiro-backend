const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const schema = mongoose.Schema;
const expression = { isActive: { $eq: true } };

function permissionLengthValidator(arr) {
  return arr.length == 2;
}

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide first name"],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      index: {
        unique: true,
        partialFilterExpression: expression,
      },
      match: [
        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/,
        "Please provide valid email",
      ],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    phoneNumber: {
      type: String,
      required: [false, "Please provide phone number"],
      trim: true,
    },
    webURL: {
      type: String,
    },
    gender: {
      type: String,
      required: [false, "Please provide gender"],
      enum: {
        values: ["Male", "Female", "Others"],
        message: "Please choose from Male, Female or Others",
      },
    },
    location: {
      type: String,
    },
    role: {
      type: String,
      enum: {
        values: ["User", "Admin"],
        message: "Please select User or Admin",
      },
      default: "User",
    },
    Websites: [
      {
        type: schema.Types.ObjectId,
        ref: "WebsiteMaster",
      },
    ],
    profiles: {
      Dribble: {
        type: String,
        default: "",
      },
      Behance: {
        type: String,
        default: "",
      },
      Instagram: {
        type: String,
        default: "",
      },
      CreativeMarket: {
        type: String,
        default: "",
      },
      Linkedin: {
        type: String,
        default: "",
      },
      ThemeForest: {
        type: String,
        default: "",
      },
      Codepen: {
        type: String,
        default: "",
      },
      Twitter: {
        type: String,
        default: "",
      },
      Github: {
        type: String,
        default: "",
      },
    },
    passwordResetToken: {
      type: String,
      default: "",
    },
    passwordResetExpires: {
      type: Date,
    },
    sendNewsletter: {
      type: Boolean,
      default: true,
    },
    canSubmit: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    likedWebsites: [
      {
        type: mongoose.Types.ObjectId,
      },
    ],
    savedWebsites: [
      {
        type: mongoose.Types.ObjectId,
      },
    ],
    preferences: [
      {
        type: String,
        default:[]
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.isNew) {
    this.passwordChangedAt = undefined;
  }
  next();
});

userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { userId: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRATION,
    }
  );
};

userSchema.methods.changePasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changesTimeStamp =
      parseInt(this.passwordChangedAt.getTime(), 10) / 1000;
    return jwtTimestamp < changesTimeStamp;
  }
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema, "user");
