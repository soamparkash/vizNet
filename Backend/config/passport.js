const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
          isVerified: true, // Google users are verified automatically
          // We need a dummy password for the schema validation
          password: 'google-login-secret-' + profile.id, 
        };

        try {
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
             // If user exists but wasn't verified, verify them now
             if(!user.isVerified) {
                 user.isVerified = true;
                 await user.save();
             }
            done(null, user);
          } else {
            user = await User.create(newUser);
            done(null, user);
          }
        } catch (err) {
          console.error(err);
          done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};