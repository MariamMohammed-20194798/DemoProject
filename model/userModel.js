const mongoose = require("mongoose");
const crypto = require("crypto");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: [true, "Username is Required!"],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail],
    required: [true, "Email is Required!"],
  },
  password: {
    type: String,
    minlength: 8,
    select: false,
    require: [true, "Provide a password"],
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
});

// Middleware Function To Hash Password Field
userSchema.pre("save", async function (next) {
  // 1. if pass was actually modified
  if (!this.isModified("password")) return next();
  // 2. Hash pass with cost 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

// Middleware Function checks if the pass has been modified since the document was last saved.
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Data.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Middleware Function To Compare Password with PasswordConfirm
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Middleware Function If Password Changed After
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const ChangedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < ChangedTimestamp;
  }
  return false; // Not Changed
};

// Middleware Function to generates pass reset token for user.
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256") //using SHA-256 algorithm for hashing
    .update(resetToken) //then token stored in the passwordResetToken
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
