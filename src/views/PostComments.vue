<template>
  <div class="comments-section mt-4">
    <h4 class="mb-3">
      <i class="bi bi-chat-dots me-2"></i>
      Коментарі ({{ comments.length }})
    </h4>
    
    <!-- Форма додавання коментаря -->
    <div v-if="currentUser" class="card mb-4">
      <div class="card-body">
        <h6 class="card-title">
          <i class="bi bi-plus-circle me-2"></i>
          Додати коментар
        </h6>
        
        <!-- Індикатор завантаження -->
        <div v-if="isAddingComment" class="text-center mb-3">
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Додавання коментаря...</span>
          </div>
          <span class="ms-2">Додавання коментаря...</span>
        </div>
        
        <!-- Форма коментаря -->
        <form @submit.prevent="handleAddComment" v-else>
          <div class="mb-3">
            <textarea 
              class="form-control" 
              rows="3" 
              v-model="newCommentContent"
              :class="{ 'is-invalid': commentError }"
              placeholder="Введіть ваш коментар..."
              required
            ></textarea>
            <div class="invalid-feedback" v-if="commentError">
              {{ commentError }}
            </div>
            <div class="form-text">
              <i class="bi bi-info-circle me-1"></i>
              Мінімум 3 символи
            </div>
          </div>
          
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">
              <i class="bi bi-person me-1"></i>
              Коментар від: <strong>{{ currentUser.name || currentUser.email }}</strong>
            </small>
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="isAddingComment || !newCommentContent.trim()"
            >
              <i class="bi bi-send me-1"></i>
              Додати коментар
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Повідомлення для неавторизованих користувачів -->
    <div v-else class="alert alert-info">
      <i class="bi bi-info-circle me-2"></i>
      <router-link to="/login" class="text-decoration-none">
        Увійдіть
      </router-link> 
      або 
      <router-link to="/register" class="text-decoration-none">
        зареєструйтеся
      </router-link>, 
      щоб залишити коментар.
    </div>
    
    <!-- Індикатор завантаження коментарів -->
    <div v-if="isLoadingComments" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Завантаження коментарів...</span>
      </div>
      <p class="mt-2">Завантаження коментарів...</p>
    </div>
    
    <!-- Помилка завантаження коментарів -->
    <div v-else-if="loadError" class="alert alert-warning">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ loadError }}
      <button @click="loadComments" class="btn btn-outline-warning btn-sm ms-2">
        Спробувати знову
      </button>
    </div>
    
    <!-- Список коментарів -->
    <div v-else-if="comments.length > 0" class="comments-list">
      <div 
        v-for="comment in comments" 
        :key="comment.id" 
        class="comment-item card mb-3"
        :class="{ 'border-success': comment.isLocal }"
      >
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h6 class="mb-0 text-primary">
              <i class="bi bi-person-circle me-1"></i>
              {{ comment.author || 'Невідомий автор' }}
            </h6>
            <small class="text-muted d-flex align-items-center">
              <i class="bi bi-clock me-1"></i>
              {{ formatDate(comment.createdAt) }}
              <span v-if="comment.isLocal" class="badge bg-info ms-2" title="Коментар збережено локально">
                <i class="bi bi-wifi-off"></i>
              </span>
            </small>
          </div>
          <p class="card-text mb-0" style="white-space: pre-line;">{{ comment.content }}</p>
        </div>
      </div>
    </div>
    
    <!-- Повідомлення про відсутність коментарів -->
    <div v-else class="text-center my-4">
      <div class="alert alert-light">
        <i class="bi bi-chat me-2"></i>
        Поки що немає коментарів. Будьте першим!
      </div>
    </div>
  </div>
</template>

<script>
import blogModel from '@/services/blogModel.js';

export default {
  name: 'PostComments',
  props: {
    postId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      comments: [],
      newCommentContent: '',
      isLoadingComments: false,
      isAddingComment: false,
      commentError: '',
      loadError: '',
      currentUser: null
    };
  },
  created() {
    this.currentUser = blogModel.getCurrentUser();
    this.loadComments();
  },
  methods: {
    async loadComments() {
      this.isLoadingComments = true;
      this.loadError = '';
      
      try {
        console.log('Завантаження коментарів для поста:', this.postId);
        
        const comments = await blogModel.getComments(this.postId);
        this.comments = Array.isArray(comments) ? comments : [];
        
        console.log('Завантажено коментарів:', this.comments.length);
        
      } catch (error) {
        console.error('Помилка завантаження коментарів:', error);
        this.loadError = `Помилка завантаження коментарів: ${error.message}`;
        this.comments = [];
      } finally {
        this.isLoadingComments = false;
      }
    },
    
    validateComment() {
      this.commentError = '';
      
      if (!this.newCommentContent.trim()) {
        this.commentError = 'Будь ласка, введіть текст коментаря';
        return false;
      }
      
      if (this.newCommentContent.trim().length < 3) {
        this.commentError = 'Коментар повинен містити щонайменше 3 символи';
        return false;
      }
      
      if (this.newCommentContent.trim().length > 1000) {
        this.commentError = 'Коментар не повинен перевищувати 1000 символів';
        return false;
      }
      
      return true;
    },
    
    async handleAddComment() {
      if (!this.validateComment()) {
        return;
      }
      
      if (!this.currentUser) {
        this.commentError = 'Для додавання коментарів необхідно увійти в систему';
        return;
      }
      
      this.isAddingComment = true;
      this.commentError = '';
      
      try {
        console.log('Додавання коментаря до поста:', this.postId);
        
        const result = await blogModel.addComment(this.postId, {
          content: this.newCommentContent.trim()
        });
        
        if (result.success) {
          // Додаємо новий коментар до списку
          if (result.comment) {
            this.comments.push(result.comment);
          }
          
          // Очищаємо форму
          this.newCommentContent = '';
          
          // Показуємо повідомлення про успіх
          this.showSuccessMessage(result.isLocal ? 
            'Коментар додано локально (сервер недоступний)' : 
            'Коментар успішно додано'
          );
          
          // Перезавантажуємо коментарі для синхронізації
          setTimeout(() => {
            this.loadComments();
          }, 1000);
          
        } else {
          this.commentError = result.message || 'Помилка додавання коментаря';
        }
        
      } catch (error) {
        console.error('Помилка додавання коментаря:', error);
        this.commentError = error.message || 'Помилка додавання коментаря';
      } finally {
        this.isAddingComment = false;
      }
    },
    
    showSuccessMessage(message) {
      // Створюємо тимчасове повідомлення про успіх
      const successAlert = document.createElement('div');
      successAlert.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
      successAlert.style.zIndex = '9999';
      successAlert.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>
        ${message}
      `;
      document.body.appendChild(successAlert);
      
      setTimeout(() => {
        successAlert.remove();
      }, 3000);
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Невідома дата';
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return 'Невідома дата';
        }
        
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMinutes < 1) {
          return 'Щойно';
        } else if (diffMinutes < 60) {
          return `${diffMinutes} хв. тому`;
        } else if (diffHours < 24) {
          return `${diffHours} год. тому`;
        } else if (diffDays < 7) {
          return `${diffDays} дн. тому`;
        } else {
          const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          };
          return date.toLocaleDateString('uk-UA', options);
        }
      } catch (error) {
        console.error('Помилка форматування дати:', error);
        return 'Невідома дата';
      }
    }
  },
  
  watch: {
    postId: {
      handler(newPostId) {
        if (newPostId) {
          this.loadComments();
        }
      },
      immediate: false
    }
  }
};
</script>

<style scoped>
.comments-section {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.comment-item {
  border-radius: 8px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.comment-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.comment-item.border-success {
  border-left: 4px solid #28a745;
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.alert {
  border-radius: 8px;
  border: none;
}

.alert-info {
  background-color: #d1ecf1;
  color: #0c5460;
}

.alert-light {
  background-color: #fefefe;
  color: #6c757d;
  border: 1px solid #e9ecef;
}

.alert-warning {
  background-color: #fff3cd;
  color: #856404;
}

.badge {
  font-size: 0.7rem;
}

.text-primary {
  color: #0d6efd !important;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Анімація для нових коментарів */
.comment-item {
  animation: fadeInUp 0.3s ease-in-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Стилі для мобільних пристроїв */
@media (max-width: 768px) {
  .comments-section {
    padding: 1rem;
  }
  
  .d-flex.justify-content-between {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .d-flex.justify-content-between small {
    margin-top: 0.5rem;
  }
}
</style>