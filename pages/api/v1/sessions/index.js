import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user";
import password from "models/password";
import { UnauthorizedError } from "infra/errors";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;
  try {
    const storedUser = await user.findOneByEmail(userInputValues.email);
    const isPasswordMatch = await password.compare(
      userInputValues.password,
      storedUser.password,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedError({
        message: "Senha não confere.",
        action: "Verifique se a senha está correta.",
      });
    }
  } catch (error) {
    throw new UnauthorizedError({
      message: "Dados de autorização não conferem.",
      action: "Verifique se os dados enviados estão corretos.",
    });
  }
  return response.status(201).json({});
}
