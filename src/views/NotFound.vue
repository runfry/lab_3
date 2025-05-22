<template>
  <div class="row">
    <div class="col-md-6 mx-auto">
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h4 class="mb-0">Вхід</h4>
        </div>
        <div class="card-body">
          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input 
                type="email" 
                class="form-control" 
                id="email" 
                v-model="email" 
                required
                placeholder="Введіть email"
              >
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Пароль</label>
              <input 
                type="password" 
                class="form-control" 
                id="password" 
                v-model="password" 
                required
                placeholder="Введіть пароль"
              >
            </div>
            <div class="d-grid gap-2">
              <button 
                type="submit" 
                class="btn btn-primary" 
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                {{ isLoading ? 'Входимо...' : 'Увійти' }}
              </button>
            </div>
          </form>
          <div class="mt-3 text-center">
            <p>Немає облікового запису? <router-link to="/register">Зареєструватися</router-link></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      isLoading: false
    }
  },
  methods: {
    ...mapActions(['login']),
    handleLogin() {
      this.isLoading = true;
      
      this.login({ email: this.email, password: this.password })
        .then(() => {
          this.$toast.success('Успішний вхід');
          this.$router.push('/');
        })
        .catch(error => {
          this.$toast.error(`Помилка входу: ${error.message}`);
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }
}
</script>