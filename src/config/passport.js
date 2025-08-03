const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      
      // Creating new user from Google profile
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        isEmailVerified: true, // Automatically verified if using Google login
        phone: '0000000000' // You may later ask the user to update this
        // Note: userId is generated automatically in the model's pre-save hook
      });
    } else {
      console.log('Existing Google user found:', user);
    }

    done(null, user);
  } catch (err) {
    console.error('Error in Google Strategy:', err);
    done(err);
  }
}));

// For persistent sessions
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});