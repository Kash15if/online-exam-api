'use strict';

const users = new Map(); // key: email (lowercased)
const usersById = new Map(); // key: id

const userRepository = {
  findByEmail: async (email) => users.get(String(email).toLowerCase()) || null,
  findById: async (id) => usersById.get(id) || null,

  create: async (user) => {
    const stored = { ...user };
    users.set(stored.email.toLowerCase(), stored);
    usersById.set(stored.id, stored);
    return stored;
  },

  list: async () => Array.from(users.values()),

  reset: () => {
    users.clear();
    usersById.clear();
  },
};

module.exports = userRepository;
