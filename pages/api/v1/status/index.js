function status(request, response) {
  response.status(200).send({
    chave: "valor",
  });
}

export default status;
