function can(userTryingToRequest, requiredFeature, resourceTarget) {
  let authorized = false;

  const userFeatures = userTryingToRequest.features;

  if (userFeatures.includes(requiredFeature)) {
    authorized = true;
  }

  if (requiredFeature === "update:user" && resourceTarget) {
    authorized = false;

    if (
      userTryingToRequest.id === resourceTarget.id ||
      can(userTryingToRequest, "update:user:others")
    ) {
      authorized = true;
    }
  }

  return authorized;
}

const authorization = {
  can,
};

export default authorization;
