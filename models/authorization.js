import { InternalServerError } from "infra/errors";

const availableFeatures = [
  // USER
  "create:user",
  "update:user",
  "update:user:others",
  "read:user",
  "read:user:self",

  // SESSION
  "create:session",
  "read:session",

  // ACTIVATION_TOKEN
  "read:activation_token",

  // MIGRATION
  "read:migration",
  "create:migration",

  // STATUS
  "read:status",
  "read:status:all",
];

function can(userTryingToRequest, requiredFeature, resourceTarget) {
  validateUser(userTryingToRequest);
  validateFeature(requiredFeature);

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

function filterOutput(userRequesting, requiredFeature, resourceTarget) {
  validateUser(userRequesting);
  validateFeature(requiredFeature);
  validateResource(resourceTarget);

  if (requiredFeature === "read:user") {
    return {
      id: resourceTarget.id,
      username: resourceTarget.username,
      features: resourceTarget.features,
      created_at: resourceTarget.created_at,
      updated_at: resourceTarget.updated_at,
    };
  }

  if (requiredFeature === "read:user:self") {
    if (userRequesting.id === resourceTarget.id) {
      return {
        id: resourceTarget.id,
        username: resourceTarget.username,
        email: resourceTarget.email,
        features: resourceTarget.features,
        created_at: resourceTarget.created_at,
        updated_at: resourceTarget.updated_at,
      };
    }
  }

  if (requiredFeature === "read:session") {
    if (userRequesting.id === resourceTarget.user_id) {
      return {
        id: resourceTarget.id,
        token: resourceTarget.token,
        user_id: resourceTarget.user_id,
        created_at: resourceTarget.created_at,
        updated_at: resourceTarget.updated_at,
        expires_at: resourceTarget.expires_at,
      };
    }
  }

  if (requiredFeature === "read:activation_token") {
    return {
      id: resourceTarget.id,
      user_id: resourceTarget.user_id,
      created_at: resourceTarget.created_at,
      updated_at: resourceTarget.updated_at,
      expires_at: resourceTarget.expires_at,
      used_at: resourceTarget.used_at,
    };
  }

  if (requiredFeature === "read:migration") {
    return resourceTarget.map((migration) => ({
      path: migration.path,
      name: migration.name,
      timestamp: migration.timestamp,
    }));
  }

  if (requiredFeature === "read:status") {
    const output = {
      updated_at: resourceTarget.updated_at,
      dependencies: {
        database: {
          max_connections: resourceTarget.dependencies.database.max_connections,
          opened_connections:
            resourceTarget.dependencies.database.opened_connections,
        },
      },
    };

    if (can(userRequesting, "read:status:all", resourceTarget)) {
      output.dependencies.database.version =
        resourceTarget.dependencies.database.version;
    }

    return output;
  }
}

function validateUser(user) {
  if (!user || !user.features) {
    throw new InternalServerError({
      cause: "É necessário fornecer um `user` no model `authorization`.",
    });
  }
}

function validateFeature(feature) {
  if (!feature || !availableFeatures.includes(feature)) {
    throw new InternalServerError({
      cause:
        "É necessário fornecer uma `feature` conhecida no model `authorization`",
    });
  }
}

function validateResource(resource) {
  if (!resource) {
    throw new InternalServerError({
      cause:
        "É necessário fornecer um `resource` em `authorization.filterOutput()`.",
    });
  }
}

const authorization = {
  can,
  filterOutput,
};

export default authorization;
