const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Counter = require('./counter.model');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    match: [/^[a-zA-Z\s]+$/, 'Please use a valid name.'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
  },
  phone: {
    type: String,
    // required: true,
    // unique: true,
  },
  password: {
    type: String,
    select: false,
    required: function () {
      return !this.googleId; // password is required only if googleId is not present
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  userId: {
    type: String,
    unique: true,
    sparse: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isFirstLogin: {
    type: Boolean,
    default: true,
  },
  verificationToken: {
    type: String,
  },
  verificationTokenExpires: {
    type: Date,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },

}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // Generating custom userId like "PWP-XXXXXX"
  if (this.isNew && !this.userId) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'userId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const padded = String(counter.seq).padStart(6, '0');

    this.userId = `PWP${padded}`;
  }

  next();
});

// Password verification method
userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);