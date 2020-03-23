const bcrypt = require("bcrypt");

const { users, secrets } = require("../data");

exports.seed = async function(knex) {
  await knex.migrate.rollback();
  await knex.migrate.latest();

  const formattedUsers = users.map(user => {
    return {
      ...user,
      password: bcrypt.hashSync(user.password, 10)
    };
  });
  await knex("users").insert(formattedUsers);
  await knex("secrets").insert(secrets);
};
