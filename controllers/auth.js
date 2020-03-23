const { JWT_SECRET } = require("../config");
const connection = require("../db/connection");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.loginUser = (req, res, next) => {
  const { username, password } = req.body;
  console.log(username, password);

  connection("users")
    .select("*")
    .where({ username })
    .first()
    .then(user => {
      return Promise.all([user, bcrypt.compare(password, user.password)]);
    })
    .then(([user, passwordIsValid]) => {
      if (!user || !passwordIsValid) {
        next({ status: 401, msg: "invalid username or password" });
      } else {
        const token = jwt.sign(
          {
            user_id: user.user_id,
            username: user.username,
            iat: Date.now()
          },
          JWT_SECRET
        );
        res.send({ token });
      }
    });
};

exports.validateUser = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, payload) => {
      if (err) {
        next({ status: 401, msg: "unauthorised!!" });
      } else {
        req.user = payload;
        next();
      }
    });
  } catch (err) {
    next({ status: 401, msg: "unauthorised..." });
  }
};
