function can(userTryingToRequest, requiredFeature) {
  let authorized = false;

  const userFeatures = userTryingToRequest.features;

  if (userFeatures.includes(requiredFeature)) {
    authorized = true;
  }

  return authorized;
}

const authorization = {
  can,
};

export default authorization;
