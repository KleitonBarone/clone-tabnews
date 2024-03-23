import { loadEnvConfig } from "@next/env";

export default async () => {
  const projectDir = process.cwd();
  process.env.NODE_ENV = "development";
  loadEnvConfig(projectDir, true);
  process.env.NODE_ENV = "test";
};
