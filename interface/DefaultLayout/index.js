import { Header, PageLayout, Text } from "@primer/react";

export default function DefaultLayout({ children }) {
  return (
    <>
      <Header>
        <Header.Item full>
          <Header.Link href="/">Clone TabNews</Header.Link>
        </Header.Item>
        <Header.Item>
          <Header.Link href="/login">Login</Header.Link>
        </Header.Item>
        <Header.Item>
          <Header.Link href="/cadastro">Cadastrar</Header.Link>
        </Header.Item>
      </Header>
      <PageLayout>
        <PageLayout.Content>{children}</PageLayout.Content>

        <PageLayout.Footer divider="line">
          <Text size="small">{new Date().getFullYear()} Clone TabNews</Text>
        </PageLayout.Footer>
      </PageLayout>
    </>
  );
}
