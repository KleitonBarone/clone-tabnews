import database from "infra/database";
import password from "models/password";
import { ValidationError, NotFoundError } from "infra/errors";

async function findOneByUsername(username) {
  const results = await runSelectQueryByUsername(username);
  return results;
}

async function findOneByEmail(email) {
  const results = await runSelectQueryByEmail(email);
  return results;
}

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);
  await hashPasswordInObject(userInputValues);
  const newUser = await runInsertQuery(userInputValues);
  return newUser;
}

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);
  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }
  if ("username" in userInputValues) {
    await validateUniqueUsername(userInputValues.username);
  }
  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = {
    ...currentUser,
    ...userInputValues,
  };

  const updatedUser = await runUpdateQuery(userWithNewValues);

  return updatedUser;
}

async function validateUniqueEmail(email) {
  const results = await database.query({
    text: `
      SELECT
        email
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
    ;`,
    values: [email],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email para realizar esta operação.",
    });
  }
}

async function validateUniqueUsername(username) {
  const results = await database.query({
    text: `
      SELECT
        username
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
    ;`,
    values: [username],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O username informado já está sendo utilizado.",
      action: "Utilize outro username para realizar esta operação.",
    });
  }
}

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

async function runInsertQuery(userInputValues) {
  const results = await database.query({
    text: `
    INSERT INTO
      users (username, email, password)
    VALUES
      ($1, $2, $3)
    RETURNING 
      *
    ;`,
    values: [
      userInputValues.username,
      userInputValues.email,
      userInputValues.password,
    ],
  });

  return results.rows[0];
}

async function runSelectQueryByUsername(username) {
  const results = await database.query({
    text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(username) = LOWER($1)
      LIMIT
        1
    ;`,
    values: [username],
  });

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message: "O username informado não foi encontrado no sistema.",
      action: "Verifique se o username está digitado corretamente.",
    });
  }

  return results.rows[0];
}

async function runSelectQueryByEmail(email) {
  const results = await database.query({
    text: `
      SELECT
        *
      FROM
        users
      WHERE
        LOWER(email) = LOWER($1)
      LIMIT
        1
    ;`,
    values: [email],
  });

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message: "O email informado não foi encontrado no sistema.",
      action: "Verifique se o email está digitado corretamente.",
    });
  }

  return results.rows[0];
}

async function runUpdateQuery(userInputValues) {
  const results = await database.query({
    text: `
      UPDATE
        users
      SET
        username = $2,
        email = $3,
        password = $4,
        updated_at = timezone('utc', now())
      WHERE
        id = $1
      RETURNING
        *
    ;`,
    values: [
      userInputValues.id,
      userInputValues.username,
      userInputValues.email,
      userInputValues.password,
    ],
  });

  return results.rows[0];
}

const user = {
  create,
  findOneByUsername,
  findOneByEmail,
  update,
};

export default user;
