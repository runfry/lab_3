// authService.js
export default {
  users: [],

  registerUser(user) {
    // Перевірка чи вже є користувач з таким email
    const exists = this.users.some(u => u.email === user.email);
    if (exists) {
      return { success: false, message: 'Користувач з таким email вже існує' };
    }
    this.users.push(user);
    return { success: true };
  },

  loginUser(credentials) {
    const user = this.users.find(u => u.email === credentials.email && u.password === credentials.password);
    if (user) {
      return { success: true };
    }
    return { success: false, message: 'Неправильний email або пароль' };
  }
}
