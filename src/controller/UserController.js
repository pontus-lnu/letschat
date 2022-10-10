import LocalStrategy from "passport-local";
import passport from "passport";
import UserModel from "../model/User.js";

const userModel = new UserModel();

passport.use(
  new LocalStrategy(async function (username, password, done) {
    try {
      const userInDb = await userModel.getUser(username);
      if (!userInDb) {
        return done(null, false);
      }
      if (userInDb.comparePassword(password)) {
        return done(null, userInDb);
      } else {
        return done(null, false);
      }
    } catch (e) {
      console.error(e);
      return done(null, false);
    }
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.getUsername());
});

passport.deserializeUser(async function (username, done) {
  try {
    const userInDb = await userModel.getUser(username);
    return done(null, userInDb);
  } catch (e) {
    console.error(e);
    done(e);
  }
});

export class UserController {
  showLoginDialog(req, res) {
    res.render("auth/login");
  }

  async isAuthenticated(req, res, next) {
    if (!req.user) {
      res.redirect("/auth");
    } else {
      next();
    }
  }

  showWelcome(req, res) {
    res.render("auth");
  }

  showsignupDialog(req, res) {
    res.render("auth/signup");
  }

  async doLogin(req, res, next) {
    passport.authenticate("local", {
      successReturnToOrRedirect: "/",
      failureRedirect: "/auth/login",
    })(req, res, next);
  }

  async doLogout(req, res) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/auth");
    });
  }

  async doSignup(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;
    try {
      const newUser = await userModel.createUser(username, password);
      req.login(newUser, function (err) {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });
    } catch (e) {
      console.error(e);
      res.redirect("/auth/signup");
    }
  }
}
