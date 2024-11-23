const users = new Map();

class UserStore {
  static addUser(user) {
    users.set(user.email, user);
  }

  static getUser(email) {
    return users.get(email);
  }

  static getAllUsers() {
    return Array.from(users.values());
  }
}

module.exports = UserStore; 