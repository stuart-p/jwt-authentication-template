const connection = require("../db/connection");

exports.revealSecrets = (req, res, next) => {
  const { user_id } = req.user;
  connection("secrets")
    .select("secrets.*", "users.username")
    .join("users", "users.user_id", "=", "secrets.user_id")
    .where("secrets.user_id", user_id)
    .then(secrets => {
      res.send({ secrets });
    });
};
