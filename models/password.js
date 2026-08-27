import bcryptjs from "bcryptjs";
import { InternalServerError } from "infra/errors.js";

function getPepper() {
  const pepper = process.env.PEPPER;

  if (!pepper) {
    throw new InternalServerError({
      cause: "PEPPER não foi encontrada.",
    });
  }
  return pepper;
}

async function hash(password) {
  const rounds = getNumberOfRounds();
  return await bcryptjs.hash(password + getPepper(), rounds);
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(provadedPasspword, storedPassword) {
  return await bcryptjs.compare(provadedPasspword, storedPassword);
}

const password = {
  hash,
  compare,
  getPepper,
};

export default password;
