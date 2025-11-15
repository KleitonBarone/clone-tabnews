import database from "infra/database";
import email from "infra/email";
import { NotFoundError } from "infra/errors";
import webserver from "infra/webserver";

const EXPIRATION_IN_MILLISECONDS = 15 * 60 * 1000; // 15 minutes

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;
}

async function findOneValidById(userId) {
  const tokenFound = await runSelectQuery(userId);
  return tokenFound;
}

async function runSelectQuery(userId) {
  const results = await database.query({
    text: `
      SELECT 
        *
      FROM 
        user_activation_tokens
      WHERE 
        id = $1
        AND expires_at > NOW()
        AND used_at IS NULL
      LIMIT 1
      ;`,
    values: [userId],
  });

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message: "Token de ativação não foi encontrado no sistema ou expirou.",
      action: "Faça um novo cadastro.",
    });
  }

  return results.rows[0];
}

async function runInsertQuery(userId, expiresAt) {
  const results = await database.query({
    text: `
      INSERT INTO 
        user_activation_tokens (user_id, expires_at) 
      VALUES 
        ($1, $2)
      RETURNING
        *
      ;`,
    values: [userId, expiresAt],
  });

  return results.rows[0];
}

async function sendEmailtoUser(user, activationToken) {
  await email.send({
    from: "TabNews <contato@exemplo.com>",
    to: user.email,
    subject: "Ative seu cadastro no TabNews!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro no TabNews:

${webserver.origin}/cadastro/ativar/${activationToken.id}

Atenciosamente,
Equipe TabNews`,
  });
}

const activation = {
  sendEmailtoUser,
  create,
  findOneValidById,
};

export default activation;
