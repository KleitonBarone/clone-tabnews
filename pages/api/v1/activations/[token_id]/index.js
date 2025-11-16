import controller from "infra/controller";
import activation from "models/activation";
import { createRouter } from "next-connect";

const router = createRouter();

router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const tokenId = request.query.token_id;

  const tokenInfo = await activation.findOneValidById(tokenId);

  const updatedToken = await activation.markTokenAsUsed(tokenInfo);

  await activation.activateUserById(tokenInfo.user_id);

  return response.status(200).json(updatedToken);
}
