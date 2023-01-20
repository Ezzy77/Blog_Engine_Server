const users = require("../controllers/users.controllers");
const auth = require("../lib/middleware");
module.exports = function (app) {
  app
    .route("/users")
    .get(auth.isAuthenticated, users.getAll)
    .post(auth.isAuthenticated, users.create);
  // .post(auth.isAuthenticated,users.create);

  app.route("/login").post(users.login);

  app.route("/logout", auth).post(auth.isAuthenticated, users.logout);
};
