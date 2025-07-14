const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
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
  name: {
    type: String,
  },
  userId: {
    type: String,
    unique: true,
    sparse: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  verificationTokenExpires: {
    type: Date,
  }
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // Generating custom userId for the user
  if (!this.userId && this.name) {
    const namePart = this.name.trim().split(' ')[0]; // First name
    const regex = new RegExp(`^${namePart}`, 'i');

    const latestUser = await this.constructor
      .findOne({ userId: { $regex: regex } })
      .sort({ createdAt: -1 });

    let suffix = '0001';
    if (latestUser && latestUser.userId) {
      const match = latestUser.userId.match(/\d+$/);
      if (match) {
        const num = parseInt(match[0]) + 1;
        suffix = num.toString().padStart(4, '0');
      }
    }

    this.userId = `${namePart}${suffix}`;
  }

  next();
});

// Password verification method
userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);