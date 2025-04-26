import bcrypt from "bcryptjs";

async function hash(password) {
  const rounds = getNumberOfRounds();
  return await bcrypt.hash(password, rounds);
}

function getNumberOfRounds() {
  if (process.env.NODE_ENV === "production") {
    return 14;
  }

  return 1;
}

async function compare(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
