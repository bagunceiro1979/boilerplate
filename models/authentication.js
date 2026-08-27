import user from "models/user.js";
import password from "models/password.js";
import { NotFoundError, UnauthorizedError } from "infra/errors.js";

async function getAuthenticateUser(provadedEmail, provadedPassword) {
  try {
    const storedUser = await findUserByEmail(provadedEmail);
    await validetePassword(provadedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
      });
    }
    throw error;
  }

  async function findUserByEmail(provadedEmail) {
    let storedUser;
    try {
      storedUser = await user.findOneByEmail(provadedEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Email não confere.",
          action: "Verifique se esse dado está correto.",
        });
      }
      throw error;
    }
    return storedUser;
  }

  async function validetePassword(provadedPassword, storedPaasword) {
    const correctPasswordMatch = await password.compare(
      provadedPassword,
      storedPaasword,
    );
    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Senha não confere.",
        action: "Verifique se esse dado está correto.",
      });
    }
  }
}

const authentication = {
  getAuthenticateUser,
};

export default authentication;
