const dotenv = require("dotenv");

export default async () => {
  dotenv.config({
    path: ".env.development",
  });
};
