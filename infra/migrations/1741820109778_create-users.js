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

    // BCrypt hashes are 60 characters long
    password: { type: "varchar(60)", notNull: true },

    // timestamptz for timezone support
    created_at: {
      type: "timestamptz",
      default: pgm.func("timezone('utc', now())"),
      notNull: true,
    },
    updated_at: {
      type: "timestamptz",
      default: pgm.func("timezone('utc', now())"),
      notNull: true,
    },
  });
};

exports.down = false;
