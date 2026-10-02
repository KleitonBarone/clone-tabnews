import { Banner, Heading, Stack } from "@primer/react";
import { Card } from "@primer/react/experimental";
import DefaultLayout from "interface/DefaultLayout";
import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <DefaultLayout
      contentWidth="medium"
      metadata={{
        title: "Status",
        description: "Consulte o status dos serviços do Clone TabNews.",
      }}
    >
      <Stack gap="spacious">
        <Heading as="h1">Status Page</Heading>
        <DatabaseStatus />
        <UpdatedAt />
      </Stack>
    </DefaultLayout>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  if (isLoading || !data) {
    return;
  }

  const updatedAtText = new Date(data.updated_at).toLocaleString();

  return (
    <Banner variant="info" layout="compact">
      <Banner.Title>Ultima atualização: {updatedAtText}</Banner.Title>
    </Banner>
  );
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  if (isLoading || !data) {
    return;
  }

  const databaseStatusInformation = data.dependencies.database;
  const databaseVersion = databaseStatusInformation.version ?? "-";
  const databaseOpenedConnections =
    databaseStatusInformation.opened_connections;
  const databaseMaxConnections = databaseStatusInformation.max_connections;

  return (
    <Stack>
      <Heading as="h2" variant="medium">
        Banco de dados
      </Heading>
      <Stack direction={{ narrow: "vertical", regular: "horizontal" }}>
        <Stack.Item grow>
          <Card>
            <Card.Heading>PostgreSQL</Card.Heading>
            <Card.Description>{databaseVersion}</Card.Description>
            <Card.Metadata>Versão em execução</Card.Metadata>
          </Card>
        </Stack.Item>
        <Stack.Item grow>
          <Card>
            <Card.Heading>Conexões abertas</Card.Heading>
            <Card.Description>{databaseOpenedConnections}</Card.Description>
            <Card.Metadata>Uso nesse instante</Card.Metadata>
          </Card>
        </Stack.Item>
        <Stack.Item grow>
          <Card>
            <Card.Heading>Conexões máximas</Card.Heading>
            <Card.Description>{databaseMaxConnections}</Card.Description>
            <Card.Metadata>Conexões disponiveis</Card.Metadata>
          </Card>
        </Stack.Item>
      </Stack>
    </Stack>
  );
}
