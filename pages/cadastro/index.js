import { Button, FormControl, Heading, Stack, TextInput } from "@primer/react";
import DefaultLayout from "interface/DefaultLayout";
import { useState } from "react";

export default function RegisterPage() {
  return (
    <DefaultLayout
      contentWidth="small"
      metadata={{
        title: "Cadastro",
        description: "Crie sua conta de forma gratuita.",
      }}
    >
      <Stack gap="spacious">
        <Heading as="h1">Cadastro</Heading>
        <RegisterForm />
      </Stack>
    </DefaultLayout>
  );
}

function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const requestBody = { username, email, password };

    const response = await fetch("/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 201) {
      location.href = "/cadastro/confirmar";
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="normal">
        <FormControl>
          <FormControl.Label>Nome de usuario</FormControl.Label>
          <TextInput
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            block
          />
        </FormControl>

        <FormControl>
          <FormControl.Label>Email</FormControl.Label>
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            block
          />
        </FormControl>

        <FormControl>
          <FormControl.Label>Senha</FormControl.Label>
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            block
          />
        </FormControl>

        <Stack.Item>
          <Button type="submit" variant="primary">
            Criar cadastro
          </Button>
        </Stack.Item>
      </Stack>
    </form>
  );
}
