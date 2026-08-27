import database from "infra/database.js";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username) {
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
        name: "NotFoundError",
        message: "O username informado não foi encontrado no systema.",
        action: "Verifique se o username foi digitado corretamente.",
        status_code: 404,
      });
    }
    return results.rows[0];
  }
}

async function findOneByEmail(email) {
  const userFound = await runSelectQuery(email);

  return userFound;

  async function runSelectQuery(email) {
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
        name: "NotFoundError",
        message: "O email informado não foi encontrado no systema.",
        action: "Verifique se o email foi digitado corretamente.",
        status_code: 404,
      });
    }
    return results.rows[0];
  }
}

async function create(userInputValues) {
  await validateUniqueUsername(userInputValues.username);
  await validateUniqueEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQery(userInputValues);
  return newUser;

  async function runInsertQery(userInputValues) {
    const results = await database.query({
      text: `
          INSERT INTO 
            users (username, email, password) 
          VALUES 
            ($1, $2, $3)
          RETURNING *
          ;`,

      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return results.rows[0];
  }
}

async function update(username, usersInputValues) {
  const currentUser = await findOneByUsername(username);

  if ("username" in usersInputValues) {
    await validateUniqueUsername(usersInputValues.username);
  }
  if ("email" in usersInputValues) {
    await validateUniqueEmail(usersInputValues.email);
  }
  if ("password" in usersInputValues) {
    await hashPasswordInObject(usersInputValues);
  }
  const userWithNewValues = { ...currentUser, ...usersInputValues };
  const updatedUser = await runUpdateQuery(userWithNewValues);
  return updatedUser;

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
      message: "O apelido informado já está sendo utilizado.",
      action: "Utilize outro apelido para realizar esta operação.",
    });
  }
}

async function validateUniqueEmail(email) {
  const results = await database.query({
    text: `
      SELECT 
        email 
      FROM 
       users 
      WHERE 
      LOWER(email) = LOWER($1);`,
    values: [email],
  });
  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O Email informado já está sendo utilizado.",
      action: "Utilize outro email para realizar esta operação.",
    });
  }
}

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

const user = {
  create,
  update,
  findOneByUsername,
  findOneByEmail,
};

export default user;
