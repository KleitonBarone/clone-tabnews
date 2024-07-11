const dotenv = require("dotenv");

const jestSetup = async () => {
  dotenv.config({
    path: ".env.development",
  });
};

export default jestSetup;
