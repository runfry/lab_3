<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card">
        <div class="card-body">
          <h2 class="text-center mb-4">Вхід до системи</h2>
          <form @submit.prevent="handleLogin" novalidate>
            <div class="mb-3">
              <label for="email" class="form-label">Email *</label>
              <input 
                type="email" 
                class="form-control" 
                id="email" 
                v-model="email" 
                required
                :class="{ 'is-invalid': errors.email }"
              >
              <div class="invalid-feedback" v-if="errors.email">{{ errors.email }}</div>
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Пароль *</label>
              <div class="input-group">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  class="form-control" 
                  id="password" 
                  v-model="password" 
                  required
                  :class="{ 'is-invalid': errors.password }"
                >
                <button 
                  type="button" 
                  class="btn btn-outline-secondary" 
                  @click="togglePassword"
                >
                  <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <div class="invalid-feedback" v-if="errors.password">{{ errors.password }}</div>
            </div>
            <button type="submit" class="btn btn-primary w-100">Увійти</button>
            <div class="mt-3 text-center">
              <p>Ще не зареєстровані? <router-link to="/register">Створити акаунт</router-link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import blogModel from '@/blogModel.js';

export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      errors: {
        email: '',
        password: ''
      }
    };
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    validateForm() {
      let isValid = true;
      this.errors = { email: '', password: '' };

      if (!this.email) {
        this.errors.email = 'Будь ласка, введіть email';
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(this.email)) {
        this.errors.email = 'Будь ласка, введіть коректний email';
        isValid = false;
      }

      if (!this.password) {
        this.errors.password = 'Будь ласка, введіть пароль';
        isValid = false;
      }

      return isValid;
    },
    async handleLogin() {
      if (!this.validateForm()) return;

      try {
        const result = await blogModel.loginUser(this.email, this.password);

        if (result.success) {
          this.$router.push('/');
        } else {
          alert(result.message);
        }
      } catch (error) {
        alert('Виникла помилка при вході');
        console.error(error);
      }
    }
  }
};
</script>

<style scoped>
/* Додай свої стилі, якщо потрібно */
</style>
