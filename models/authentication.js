import { NotFoundError, UnauthorizedError } from "infra/errors";
import password from "./password";
import user from "./user";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    let storedUser;

    try {
      storedUser = await user.findOneByEmail(providedEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Email não confere.",
          action: "Verifique se o email está correto.",
          cause: error,
        });
      }

      throw error;
    }

    const isPasswordMatch = await password.compare(
      providedPassword,
      storedUser.password,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedError({
        message: "Senha não confere.",
        action: "Verifique se a senha está correta.",
      });
    }

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autorização não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        cause: error,
      });
    }

    throw error;
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
