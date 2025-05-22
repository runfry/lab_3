<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <h2 class="text-center mb-4">
              <i class="bi bi-plus-circle me-2"></i>
              Додати новий пост
            </h2>
            
            <!-- Індикатор завантаження -->
            <div v-if="loading" class="text-center mb-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Публікація...</span>
              </div>
              <p class="mt-2">Публікація поста...</p>
            </div>
            
            <!-- Форма додавання поста -->
            <form @submit.prevent="handleAddPost" novalidate v-else>
              <div class="mb-3">
                <label for="postTitle" class="form-label">
                  <i class="bi bi-card-heading me-1"></i>
                  Назва посту *
                </label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="postTitle"
                  v-model="title"
                  :class="{ 'is-invalid': errors.title }"
                  placeholder="Введіть назву посту"
                  required
                >
                <div class="invalid-feedback" v-if="errors.title">
                  {{ errors.title }}
                </div>
              </div>
              
              <div class="mb-3">
                <label for="postContent" class="form-label">
                  <i class="bi bi-card-text me-1"></i>
                  Текст посту *
                </label>
                <textarea 
                  class="form-control" 
                  id="postContent" 
                  rows="8"
                  v-model="content"
                  :class="{ 'is-invalid': errors.content }"
                  placeholder="Введіть текст посту..."
                  required
                ></textarea>
                <div class="invalid-feedback" v-if="errors.content">
                  {{ errors.content }}
                </div>
                <div class="form-text">
                  <i class="bi bi-info-circle me-1"></i>
                  Мінімум 10 символів
                </div>
              </div>
              
              <!-- Попередній перегляд -->
              <div v-if="showPreview && title && content" class="mb-4">
                <div class="card bg-light">
                  <div class="card-header">
                    <h6 class="mb-0">
                      <i class="bi bi-eye me-1"></i>
                      Попередній перегляд
                    </h6>
                  </div>
                  <div class="card-body">
                    <h5 class="card-title">{{ title }}</h5>
                    <p class="card-text" style="white-space: pre-line;">{{ content }}</p>
                    <small class="text-muted">
                      <i class="bi bi-calendar me-1"></i>
                      {{ formatDate(new Date()) }}
                    </small>
                  </div>
                </div>
              </div>
              
              <!-- Кнопки -->
              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-primary btn-lg"
                  :disabled="loading"
                >
                  <i class="bi bi-send me-2"></i>
                  Опублікувати
                </button>
                
                <button 
                  type="button" 
                  class="btn btn-outline-secondary"
                  @click="togglePreview"
                >
                  <i class="bi bi-eye me-2" v-if="!showPreview"></i>
                  <i class="bi bi-eye-slash me-2" v-else></i>
                  {{ showPreview ? 'Сховати перегляд' : 'Показати перегляд' }}
                </button>
                
                <button 
                  type="button" 
                  class="btn btn-outline-danger"
                  @click="clearForm"
                  v-if="title || content"
                >
                  <i class="bi bi-trash me-2"></i>
                  Очистити форму
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Довідкова інформація -->
        <div class="card mt-4">
          <div class="card-body">
            <h6 class="card-title">
              <i class="bi bi-lightbulb me-2"></i>
              Поради для написання постів
            </h6>
            <ul class="list-unstyled mb-0">
              <li class="mb-2">
                <i class="bi bi-check-circle text-success me-2"></i>
                Використовуйте зрозумілі та цікаві заголовки
              </li>
              <li class="mb-2">
                <i class="bi bi-check-circle text-success me-2"></i>
                Структуруйте текст за допомогою абзаців
              </li>
              <li class="mb-2">
                <i class="bi bi-check-circle text-success me-2"></i>
                Перевіряйте орфографію та граматику
              </li>
              <li>
                <i class="bi bi-check-circle text-success me-2"></i>
                Використовуйте попередній перегляд перед публікацією
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import blogModel from '../services/blogModel';

export default {
  name: 'AddPostView',
  data() {
    return {
      title: '',
      content: '',
      errors: {},
      loading: false,
      showPreview: false
    };
  },
  created() {
    // Перевіряємо авторизацію при завантаженні компонента
    this.checkAuth();
  },
  methods: {
    checkAuth() {
      console.log('Перевірка авторизації в AddPost...');
      const user = blogModel.getCurrentUser();
      console.log('Отриманий користувач:', user);
      
      if (!user || !user.token) {
        console.log('Користувач не авторизований, перенаправлення на /login');
        this.$router.push('/login');
      } else {
        console.log('Користувач авторизований:', user.name);
      }
    },
    
    validateForm() {
      this.errors = {};

      if (!this.title.trim()) {
        this.errors.title = 'Будь ласка, введіть назву посту';
      } else if (this.title.trim().length < 3) {
        this.errors.title = 'Назва посту повинна містити щонайменше 3 символи';
      } else if (this.title.trim().length > 100) {
        this.errors.title = 'Назва посту не повинна перевищувати 100 символів';
      }

      if (!this.content.trim()) {
        this.errors.content = 'Будь ласка, введіть текст посту';
      } else if (this.content.trim().length < 10) {
        this.errors.content = 'Текст посту повинен містити щонайменше 10 символів';
      } else if (this.content.trim().length > 5000) {
        this.errors.content = 'Текст посту не повинен перевищувати 5000 символів';
      }

      return Object.keys(this.errors).length === 0;
    },

    async handleAddPost() {
      if (!this.validateForm()) {
        // Прокручуємо до першої помилки
        const firstError = document.querySelector('.is-invalid');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
        return;
      }

      this.loading = true;

      try {
        console.log('Спроба додати пост...');
        
        // Повторна перевірка авторизації перед надсиланням запиту
        const user = blogModel.getCurrentUser();
        if (!user || !user.token) {
          this.$router.push('/login');
          return;
        }
        
        const result = await blogModel.addPost({
          title: this.title.trim(),
          content: this.content.trim()
        });

        console.log('Пост успішно додано:', result);
        
        // Показуємо повідомлення про успіх
        this.showSuccessMessage();
        
        // Очищаємо форму
        this.clearForm();
        
        // Перенаправляємо на сторінку поста
        if (result && result.post && result.post.id) {
          this.$router.push(`/post/${result.post.id}`);
        } else {
          this.$router.push('/');
        }
        
      } catch (error) {
        console.error('Помилка при додаванні поста:', error);
        
        if (error.message.includes('авторизований') || error.message.includes('401')) {
          alert('Ваша сесія закінчилася. Будь ласка, увійдіть в систему знову.');
          this.$router.push('/login');
        } else {
          alert(`Помилка додавання поста: ${error.message}`);
        }
      } finally {
        this.loading = false;
      }
    },
    
    clearForm() {
      this.title = '';
      this.content = '';
      this.errors = {};
      this.showPreview = false;
    },
    
    togglePreview() {
      this.showPreview = !this.showPreview;
    },
    
    showSuccessMessage() {
      // Можна додати toast повідомлення або інший UI елемент
      const successToast = document.createElement('div');
      successToast.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
      successToast.style.zIndex = '9999';
      successToast.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>
        Пост успішно опубліковано!
      `;
      document.body.appendChild(successToast);
      
      setTimeout(() => {
        successToast.remove();
      }, 3000);
    },
    
    formatDate(date) {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return date.toLocaleDateString('uk-UA', options);
    }
  }
};
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  border-radius: 12px 12px 0 0 !important;
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

.btn-primary:hover {
  background: linear-gradient(45deg, #0056b3, #004085);
  transform: translateY(-1px);
}

.btn-outline-secondary:hover,
.btn-outline-danger:hover {
  transform: translateY(-1px);
}

.form-label {
  font-weight: 600;
  color: #495057;
}

.form-text {
  font-size: 0.875rem;
}

.spinner-border {
  width: 2rem;
  height: 2rem;
}

.list-unstyled li {
  padding: 0.25rem 0;
}

/* Анімація для появи попереднього перегляду */
.card.bg-light {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
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
  .container {
    padding: 0 15px;
  }
  
  .card-body {
    padding: 1.5rem 1rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
}
</style>