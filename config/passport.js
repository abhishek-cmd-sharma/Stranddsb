const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
      callbackURL: process.env.NODE_ENV === 'production'
        ? 'https://strandds.techember.in/api/auth/google/callback'
        : 'http://localhost:5000/api/auth/google/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in our db with the given googleId
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with this email but logged in with local/facebook before
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            // Update the existing user to include googleId
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }
        }

        // If not, create a new user in our db
        const newUser = new User({
          name: profile.displayName || 'Google User',
          email: email || `${profile.id}@google.placeholder.com`,
          googleId: profile.id,
          authProvider: 'google',
        });

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        console.error(err);
        return done(err, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID || 'placeholder',
      clientSecret: process.env.FACEBOOK_APP_SECRET || 'placeholder',
      callbackURL: process.env.NODE_ENV === 'production'
        ? 'https://strandds.techember.in/api/auth/facebook/callback'
        : 'http://localhost:5000/api/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'emails'],
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ facebookId: profile.id });

        if (user) {
          return done(null, user);
        }

        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            user.facebookId = profile.id;
            await user.save();
            return done(null, user);
          }
        }

        const newUser = new User({
          name: profile.displayName || 'Facebook User',
          email: email || `${profile.id}@facebook.placeholder.com`,
          facebookId: profile.id,
          authProvider: 'facebook',
        });

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        console.error(err);
        return done(err, null);
      }
    }
  )
);

// We don't strictly need serializeUser/deserializeUser if we are issuing JWTs in the callback,
// but passport requires them to be defined if we use session (which some OAuth flows rely on slightly).
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

module.exports = passport;
