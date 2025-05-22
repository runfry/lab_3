<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card">
        <div class="card-body">
          <h2 class="text-center mb-4">Вхід до системи</h2>
          
          <!-- Індикатор завантаження -->
          <div v-if="isLoading" class="text-center mb-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Авторизація...</span>
            </div>
            <p class="mt-2">Авторизація...</p>
          </div>
          
          <!-- Форма логіну -->
          <form @submit.prevent="handleLogin" novalidate v-else>
            <div class="mb-3">
              <label for="email" class="form-label">
                <i class="bi bi-envelope me-1"></i>
                Email *
              </label>
              <input 
                type="email" 
                class="form-control" 
                id="email" 
                v-model="email" 
                required
                :class="{ 'is-invalid': errors.email }"
                placeholder="Введіть email"
              >
              <div class="invalid-feedback" v-if="errors.email">{{ errors.email }}</div>
            </div>
            
            <div class="mb-3">
              <label for="password" class="form-label">
                <i class="bi bi-lock me-1"></i>
                Пароль *
              </label>
              <div class="input-group">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  class="form-control" 
                  id="password" 
                  v-model="password" 
                  required
                  :class="{ 'is-invalid': errors.password }"
                  placeholder="Введіть пароль"
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
            
            <!-- Повідомлення про помилку загального характеру -->
            <div v-if="generalError" class="alert alert-danger" role="alert">
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{ generalError }}
            </div>
            
            <!-- Повідомлення про успіх -->
            <div v-if="successMessage" class="alert alert-success" role="alert">
              <i class="bi bi-check-circle me-2"></i>
              {{ successMessage }}
            </div>
            
            <div class="d-grid gap-2">
              <button 
                type="submit" 
                class="btn btn-primary btn-lg"
                :disabled="isLoading"
              >
                <i class="bi bi-box-arrow-in-right me-2"></i>
                Увійти
              </button>
            </div>
            
            <div class="mt-3 text-center">
              <p class="mb-0">
                Ще не зареєстровані? 
                <router-link to="/register" class="text-decoration-none">
                  <strong>Створити акаунт</strong>
                </router-link>
              </p>
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
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      isLoading: false,
      generalError: '',
      successMessage: '',
      errors: {
        email: '',
        password: ''
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
        email: '',
        password: ''
      };
      
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
      // Очищаємо попередні повідомлення
      this.generalError = '';
      this.successMessage = '';
      
      if (!this.validateForm()) {
        // Прокручуємо до першої помилки
        const firstError = document.querySelector('.is-invalid');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
        return;
      }
      
      this.isLoading = true;
      
      try {
        console.log('Спроба входу...');
        
        const result = await blogModel.loginUser(this.email, this.password);
        
        console.log('Результат логіну:', result);
        
        if (result.success) {
          this.successMessage = 'Вхід успішний! Перенаправлення...';
          
          // Показуємо повідомлення про успіх на короткий час
          setTimeout(() => {
            // Перенаправляємо на головну сторінку
            this.$router.push('/').then(() => {
              // Перезавантажуємо сторінку після переходу
              window.location.reload();
            });
          }, 1000);
          
        } else {
          this.generalError = result.message || 'Невірний email або пароль';
        }
        
      } catch (error) {
        console.error('Помилка при вході:', error);
        
        if (error.isNetworkError) {
          this.generalError = 'Не вдалося підключитися до сервера. Перевірте підключення до Інтернету.';
        } else {
          this.generalError = error.message || 'Серверна помилка. Спробуйте пізніше.';
        }
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.form-control {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(45deg, #0d6efd, #0056b3);
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(45deg, #0056b3, #004085);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-outline-secondary:hover {
  transform: translateY(-1px);
}

.form-label {
  font-weight: 600;
  color: #495057;
}

.spinner-border {
  width: 2rem;
  height: 2rem;
}

.input-group .btn {
  border-radius: 0 8px 8px 0;
}

.alert {
  border-radius: 8px;
  border: none;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
}

.alert-success {
  background-color: #d1edff;
  color: #0c5460;
}

/* Анімація для повідомлень */
.alert {
  animation: slideIn 0.3s ease-in-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Стилі для мобільних пристроїв */
@media (max-width: 768px) {
  .card-body {
    padding: 1.5rem 1rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
}
</style>