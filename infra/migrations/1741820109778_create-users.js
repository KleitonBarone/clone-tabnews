exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    // For reference GitHub limits usernames to 39 characters
    username: { type: "varchar(30)", notNull: true, unique: true },

    // Email max length is 254 characters
    email: { type: "varchar(254)", notNull: true, unique: true },

    // BCrypt hashes are 72 characters long max
    password: { type: "varchar(72)", notNull: true },

    // timestamptz for timezone support
    created_at: { type: "timestamptz", default: pgm.func("now()") },
    updated_at: { type: "timestamptz", default: pgm.func("now()") },
  });
};

exports.down = false;
