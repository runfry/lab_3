<template>
  <div class="container mt-4">
    <!-- Завантаження поста -->
    <div v-if="isLoadingPost" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Завантаження поста...</span>
      </div>
      <p class="mt-2 text-muted">Завантаження поста...</p>
    </div>

    <!-- Помилка завантаження поста -->
    <div v-else-if="!post" class="text-center py-5">
      <div class="alert alert-danger">
        <h4>Пост не знайдено</h4>
        <p>Можливо, пост було видалено або ви перейшли за неправильним посиланням.</p>
        <router-link to="/" class="btn btn-primary">Повернутися на головну</router-link>
      </div>
    </div>

    <!-- Контент поста -->
    <div v-else>
      <!-- Навігація -->
      <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link to="/">Головна</router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">{{ post.title }}</li>
        </ol>
      </nav>

      <!-- Пост -->
      <article class="card mb-4">
        <div class="card-header">
          <h1 class="h3 mb-2">{{ post.title }}</h1>
          <div class="text-muted small">
            <i class="bi bi-person-circle me-1"></i>
            <strong>{{ post.author || 'Невідомий автор' }}</strong>
            <span class="mx-2">•</span>
            <i class="bi bi-calendar3 me-1"></i>
            {{ formatDate(post.createdAt) }}
          </div>
        </div>
        <div class="card-body">
          <div class="post-content">
            {{ post.content }}
          </div>
        </div>
      </article>

      <!-- Розділ коментарів -->
      <section class="comments-section">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="h4 mb-0">
            💬 Коментарі 
            <span class="badge bg-secondary">{{ comments.length }}</span>
          </h3>
          <button 
            @click="loadComments" 
            class="btn btn-outline-secondary btn-sm"
            :disabled="isLoadingComments"
          >
            <i class="bi bi-arrow-clockwise me-1"></i>
            {{ isLoadingComments ? 'Оновлення...' : 'Оновити' }}
          </button>
        </div>
        
        <!-- Форма додавання коментаря -->
        <div v-if="currentUser" class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">Залишити коментар</h5>
            <form @submit.prevent="addComment">
              <div class="mb-3">
                <textarea 
                  v-model="newComment" 
                  class="form-control" 
                  rows="4" 
                  placeholder="Напишіть ваш коментар..."
                  :disabled="isAddingComment"
                  required
                ></textarea>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">
                  Коментуєте як: <strong>{{ currentUser.name || currentUser.email }}</strong>
                </small>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="isAddingComment || !newComment.trim()"
                >
                  <span v-if="isAddingComment" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isAddingComment ? 'Додаємо...' : 'Додати коментар' }}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Повідомлення для неавторизованих користувачів -->
        <div v-else class="alert alert-info mb-4">
          <div class="d-flex align-items-center">
            <i class="bi bi-info-circle me-2"></i>
            <div class="flex-grow-1">
              <strong>Увійдіть, щоб залишати коментарі</strong>
              <p class="mb-0">Тільки зареєстровані користувачі можуть коментувати пости.</p>
            </div>
            <router-link to="/login" class="btn btn-primary btn-sm">Увійти</router-link>
          </div>
        </div>
        
        <!-- Завантаження коментарів -->
        <div v-if="isLoadingComments" class="text-center py-4">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Завантаження коментарів...</span>
          </div>
          <p class="mt-2 text-muted">Завантаження коментарів...</p>
        </div>
        
        <!-- Відсутність коментарів -->
        <div v-else-if="comments.length === 0" class="text-center py-5">
          <div class="text-muted">
            <i class="bi bi-chat-dots" style="font-size: 3rem; opacity: 0.5;"></i>
            <h4 class="mt-3">Поки що немає коментарів</h4>
            <p>Будьте першим, хто залишить коментар до цього поста!</p>
          </div>
        </div>
        
        <!-- Список коментарів -->
        <div v-else class="comments-list">
          <div 
            v-for="comment in comments" 
            :key="comment.id" 
            class="comment-item mb-3"
          >
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div class="comment-header mb-2">
                    <div class="d-flex align-items-center">
                      <i class="bi bi-person-circle me-2 text-primary" style="font-size: 1.2rem;"></i>
                      <div>
                        <h6 class="mb-0">{{ comment.author }}</h6>
                        <small class="text-muted">{{ formatDate(comment.createdAt) }}</small>
                      </div>
                      <span v-if="comment.isLocal" class="badge bg-warning text-dark ms-2" title="Коментар збережено локально">
                        <i class="bi bi-wifi-off me-1"></i>Локальний
                      </span>
                    </div>
                  </div>
                </div>
                <div class="comment-content">
                  <p class="mb-0">{{ comment.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Статистика коментарів -->
        <div v-if="comments.length > 0" class="mt-4 text-center">
          <small class="text-muted">
            Всього коментарів: {{ comments.length }}
            <span v-if="localCommentsCount > 0">
              ({{ localCommentsCount }} локальних)
            </span>
          </small>
        </div>
      </section>
    </div>

    <!-- Toast повідомлення -->
    <div v-if="toastMessage" :class="toastClass" class="position-fixed bottom-0 end-0 m-3" style="z-index: 1050;">
      <div class="d-flex">
        <div class="toast-body">
          {{ toastMessage }}
        </div>
        <button type="button" class="btn-close me-2 m-auto" @click="hideToast"></button>
      </div>
    </div>
  </div>
</template>

<script>
import blogModel from '@/services/blogModel.js';

export default {
  name: 'PostView',
  data() {
    return {
      post: null,
      comments: [],
      newComment: '',
      currentUser: null,
      isLoadingPost: false,
      isLoadingComments: false,
      isAddingComment: false,
      toastMessage: '',
      toastClass: 'toast show bg-success text-white'
    }
  },
  computed: {
    postId() {
      return this.$route.params.id;
    },
    localCommentsCount() {
      return this.comments.filter(comment => comment.isLocal).length;
    }
  },
  async mounted() {
    this.currentUser = blogModel.getCurrentUser();
    await this.loadPost();
    await this.loadComments();
  },
  methods: {
    async loadPost() {
      this.isLoadingPost = true;
      try {
        console.log('Завантаження поста з ID:', this.postId);
        this.post = await blogModel.getPostById(this.postId);
        
        if (!this.post) {
          console.warn('Пост не знайдено');
        }
      } catch (error) {
        console.error('Помилка завантаження поста:', error);
        this.showToast('Помилка завантаження поста', 'error');
      } finally {
        this.isLoadingPost = false;
      }
    },

    async loadComments() {
      if (!this.post) return;
      
      this.isLoadingComments = true;
      try {
        console.log('Завантаження коментарів для поста:', this.postId);
        this.comments = await blogModel.getComments(this.postId);
        console.log('Завантажено коментарів:', this.comments.length);
      } catch (error) {
        console.error('Помилка завантаження коментарів:', error);
        this.showToast('Помилка завантаження коментарів', 'error');
      } finally {
        this.isLoadingComments = false;
      }
    },
    
    async addComment() {
      if (!this.newComment.trim() || !this.currentUser) return;
      
      this.isAddingComment = true;
      try {
        console.log('Додавання коментаря:', this.newComment);
        
        const result = await blogModel.addComment(this.postId, {
          content: this.newComment.trim()
        });
        
        console.log('Результат додавання коментаря:', result);
        
        if (result.success) {
          // Додаємо новий коментар до списку
          const newCommentObj = {
            ...result.comment,
            isLocal: result.isLocal || false
          };
          
          this.comments.push(newCommentObj);
          this.newComment = '';
          
          // Показуємо повідомлення
          const message = result.isLocal 
            ? 'Коментар збережено локально (сервер недоступний)'
            : 'Коментар успішно додано';
            
          this.showToast(message, result.isLocal ? 'warning' : 'success');
          
          // Оновлюємо коментарі з сервера через невеликий час
          if (!result.isLocal) {
            setTimeout(() => {
              this.loadComments();
            }, 1000);
          }
        } else {
          throw new Error(result.message || 'Не вдалося додати коментар');
        }
      } catch (error) {
        console.error('Помилка додавання коментаря:', error);
        this.showToast(error.message || 'Не вдалося додати коментар', 'error');
      } finally {
        this.isAddingComment = false;
      }
    },
    
    formatDate(dateString) {
      try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
          return 'щойно';
        } else if (diffInSeconds < 3600) {
          const minutes = Math.floor(diffInSeconds / 60);
          return `${minutes} хв. тому`;
        } else if (diffInSeconds < 86400) {
          const hours = Math.floor(diffInSeconds / 3600);
          return `${hours} год. тому`;
        } else {
          return date.toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      } catch (error) {
        console.error('Помилка форматування дати:', error);
        return dateString;
      }
    },

    showToast(message, type = 'success') {
      this.toastMessage = message;
      this.toastClass = `toast show ${type === 'error' ? 'bg-danger' : type === 'warning' ? 'bg-warning text-dark' : 'bg-success'} text-white`;
      
      setTimeout(() => {
        this.hideToast();
      }, 5000);
    },

    hideToast() {
      this.toastMessage = '';
    }
  },
  
  watch: {
    '$route.params.id': {
      handler() {
        this.loadPost();
        this.loadComments();
      },
      immediate: false
    }
  }
}
</script>

<style scoped>
.post-content {
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.comments-section {
  border-top: 1px solid #dee2e6;
  padding-top: 2rem;
}

.comment-item {
  transition: all 0.2s ease;
}

.comment-item:hover .card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.comment-content {
  line-height: 1.5;
  word-wrap: break-word;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.toast {
  min-width: 300px;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: "›";
}

@media (max-width: 768px) {
  .container {
    padding-left: 10px;
    padding-right: 10px;
  }
  
  .card-body {
    padding: 1rem;
  }
}
</style>