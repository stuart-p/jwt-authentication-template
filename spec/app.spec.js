const { expect } = require("chai");
const app = require("../app");
const request = require("supertest")(app);
const connection = require("../db/connection");

describe("/api", () => {
  let validUser;
  let invalidUser = "bearer invalidToken";
  beforeEach(() => {
    return connection.seed
      .run()
      .then(() => {
        return request
          .post("/api/login")
          .send({ username: "mitch", password: "secure" });
      })
      .then(({ body }) => {
        validUser = `bearer ${body.token}`;
      });
  });
  after(() => connection.destroy());

  describe("/login", () => {
    it("POST responds with an access token given correct username and password", () =>
      request
        .post("/api/login")
        .send({ username: "mitch", password: "secure" })
        .expect(200)
        .then(({ body }) => {
          expect(body).to.have.ownProperty("token");
        }));
    it("POST responds with status 401 for an incorrect password", () =>
      request
        .post("/api/login")
        .send({ username: "mitch", password: "wrongpassword" })
        .expect(401)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal("invalid username or password");
        }));
    it("POST responds with status 401 for an incorrect username", () =>
      request
        .post("/api/login")
        .send({ username: "paul", password: "secure123" })
        .expect(401)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal("invalid username or password");
        }));
  });

  describe("/secrets", () => {
    it("Responds with an array of secrets", () =>
      request
        .get("/api/secrets")
        .set("authorization", validUser)
        .expect(200)
        .then(({ body: { secrets } }) => {
          expect(secrets).to.be.an("Array");
          expect(secrets[0]).to.contain.all.keys(
            "secret_id",
            "secret_text",
            "user_id"
          );
        }));
    it("status: 401 if an invalid token is provided", () => {
      return request
        .get("/api/secrets")
        .set("authorization", invalidUser)
        .expect(401);
    });
  });
});
