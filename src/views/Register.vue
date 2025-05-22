<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card">
        <div class="card-body">
          <h2 class="text-center mb-4">Реєстрація нового користувача</h2>
          <form @submit.prevent="handleRegister" novalidate>
            <div class="mb-3">
              <label for="name" class="form-label">Ім'я *</label>
              <input 
                type="text" 
                class="form-control" 
                id="name" 
                v-model="name" 
                required
                :class="{ 'is-invalid': errors.name }"
              >
              <div class="invalid-feedback" v-if="errors.name">{{ errors.name }}</div>
            </div>
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
              <small class="form-text text-muted">Мінімум 6 символів</small>
            </div>
            <div class="mb-3">
              <label for="gender" class="form-label">Стать *</label>
              <select 
                class="form-control" 
                id="gender" 
                v-model="gender" 
                required
                :class="{ 'is-invalid': errors.gender }"
              >
                <option value="" disabled>Оберіть стать</option>
                <option value="male">Чоловіча</option>
                <option value="female">Жіноча</option>
              </select>
              <div class="invalid-feedback" v-if="errors.gender">{{ errors.gender }}</div>
            </div>
            <div class="mb-3">
              <label for="birthdate" class="form-label">Дата народження *</label>
              <input 
                type="date" 
                class="form-control" 
                id="birthdate" 
                v-model="birthdate" 
                required
                :class="{ 'is-invalid': errors.birthdate }"
              >
              <div class="invalid-feedback" v-if="errors.birthdate">{{ errors.birthdate }}</div>
            </div>
            <button type="submit" class="btn btn-primary w-100">Зареєструватися</button>
            <div class="mt-3 text-center">
              <p>Вже маєте акаунт? <router-link to="/login">Увійти</router-link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import blogModel from '@/services/blogModel.js';

export default {
  name: 'RegisterView',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      gender: '',
      birthdate: '',
      showPassword: false,
      errors: {
        name: '',
        email: '',
        password: '',
        gender: '',
        birthdate: ''
      }
    }
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    validateForm() {
      let isValid = true;
      this.errors = {
        name: '',
        email: '',
        password: '',
        gender: '',
        birthdate: ''
      };

      if (!this.name.trim()) {
        this.errors.name = 'Будь ласка, введіть ваше ім\'я';
        isValid = false;
      }

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
      } else if (this.password.length < 6) {
        this.errors.password = 'Пароль повинен містити мінімум 6 символів';
        isValid = false;
      }

      if (!this.gender) {
        this.errors.gender = 'Будь ласка, оберіть стать';
        isValid = false;
      }

      if (!this.birthdate) {
        this.errors.birthdate = 'Будь ласка, введіть дату народження';
        isValid = false;
      }

      return isValid;
    },
    async handleRegister() {
	  if (!this.validateForm()) {
		return;
	  }

	  try {
		const result = await blogModel.registerUser({
		  name: this.name,
		  email: this.email,
		  password: this.password,
		  gender: this.gender,
		  birthdate: this.birthdate
		});

		if (result.success) {
		  alert('Реєстрація успішна! Тепер ви можете увійти.');
		  this.$router.push('/login');
		} else {
		  alert(result.message || 'Помилка реєстрації');
		}
	  } catch (error) {
		console.error('Помилка при реєстрації:', error);
		alert('Сталася помилка при реєстрації. Спробуйте ще раз.');
	  }
	}
  }
}
</script>

<style scoped>
/* Додай свої стилі, якщо потрібно */
</style>
