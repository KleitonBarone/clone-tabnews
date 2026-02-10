import controller from "infra/controller";
import activation from "models/activation";
import authorization from "models/authorization";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("read:activation_token"), patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const userRequesting = request.context.user;
  const tokenId = request.query.token_id;

  const tokenInfo = await activation.findOneValidById(tokenId);

  await activation.activateUserById(tokenInfo.user_id);

  const updatedToken = await activation.markTokenAsUsed(tokenInfo);

  const secureOutputValues = authorization.filterOutput(
    userRequesting,
    "read:activation_token",
    updatedToken,
  );

  return response.status(200).json(secureOutputValues);
}
