const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
  },
  phone: {
    type: String,
    required: true,
    unique: true,
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

  // Generating custom userId like "PWP-XXXXXX"
  if (!this.userId) {
    let unique = false;
    let newId;

    while (!unique) {
      const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit number
      newId = `PWP-${randomNum}`;
      const existing = await this.constructor.findOne({ userId: newId });
      if (!existing) {
        unique = true;
      }
    }

    this.userId = newId;
  }

  next();
});

// Password verification method
userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);