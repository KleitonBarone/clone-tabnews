import email from "infra/email";

async function sendEmailtoUser(user) {
  await email.send({
    from: "TabNews <contato@exemplo.com>",
    to: user.email,
    subject: "Ative seu cadastro no TabNews!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro no TabNews:

link-para-ativar-o-cadastro

Atenciosamente,
Equipe TabNews`,
  });
}

const activation = {
  sendEmailtoUser,
};

export default activation;
