#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

// Regex patterns to check for
const patterns = [
  /AKIA[0-9A-Z]{16}/, // AWS Access Key ID
  /(?:AWS|aws|Aws)?_?SECRET_?ACCESS_?KEY[=:]["']?[A-Za-z0-9\/+]{40}/, // AWS Secret Access Key
  /ghp_[0-9a-zA-Z]{36}/, // GitHub Personal Access Token
  /ya29\.[0-9A-Za-z\-_]+/, // Google OAuth Access Token
  /xox[baprs]-([0-9a-zA-Z]{10,48})?/, // Slack API Token
  /[a-zA-Z0-9]{25,35}/, // Twitter API Key/Secret
  /postgres:\/\/[^:\s]+:[^@\s]+@[^:\s]+:\d+\/[^:\s]+/, // PostgreSQL Connection URI
  /mongodb(?:\+srv)?:\/\/(?:[a-zA-Z0-9._%+-]+:[a-zA-Z0-9._%+-]+@)?[a-zA-Z0-9._%+-]+(?:\:[0-9]+)?\/[a-zA-Z0-9._%+-]+/, // MongoDB Connection URI
  /-----BEGIN RSA PRIVATE KEY-----/, // RSA Private Key
  /-----BEGIN DSA PRIVATE KEY-----/, // DSA Private Key
  /-----BEGIN EC PRIVATE KEY-----/, // EC Private Key
  /-----BEGIN OPENSSH PRIVATE KEY-----/, // SSH Private Key
  /-----BEGIN CERTIFICATE-----/, // PEM Certificate
  /\.pfx$/, // PFX Certificate
  /[A-Za-z0-9+\/=]{88}/, // Azure Storage Account Key
  /[0-9a-fA-F]{32}/, // Heroku API Key
  /SG\.[a-zA-Z0-9\.\-_]{22}\.[a-zA-Z0-9\.\-_]{43}/, // SendGrid API Key
  /[a-zA-Z0-9_-]{32,64}/, // JWT Secret Key
  /[A-Fa-f0-9]{32}/, // AES Key
  /AIza[0-9A-Za-z-_]{35}/, // GCP API Key
  /[A-Za-z0-9\+\/]{20,}==/, // Basic Auth Credentials
  /(email|user(name)?|login)[^a-zA-Z0-9]*[=:][^a-zA-Z0-9]*[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, // Email Password Patterns
];

// Files or folders to ignore
const ignorePaths = [
  "node_modules",
  "dist",
  "package-lock.json",
  ".gitignore",
  ".husky",
];

// Check if a file should be ignored
const shouldIgnore = (file) => {
  return ignorePaths.some((ignorePath) => file.startsWith(ignorePath));
};

// Get staged files
const stagedFiles = execSync("git diff --cached --name-only")
  .toString()
  .split("\n")
  .filter(Boolean);

let foundSecret = false;

// Check each file for patterns
stagedFiles.forEach((file) => {
  if (shouldIgnore(file)) {
    return; // Skip ignored files or folders
  }

  const contents = fs.readFileSync(file, "utf8");
  patterns.forEach((pattern) => {
    if (pattern.test(contents)) {
      console.error(`Error: Potential secret detected in ${file}`);
      foundSecret = true;
    }
  });
});

if (foundSecret) {
  process.exit(1);
} else {
  process.exit(0);
}
