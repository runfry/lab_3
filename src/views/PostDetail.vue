<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <!-- Кнопка повернення -->
        <div class="mb-4">
          <button @click="goBack" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left me-2"></i>
            Повернутися
          </button>
        </div>
        
        <!-- Індикатор завантаження -->
        <div v-if="loading" class="text-center my-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Завантаження поста...</span>
          </div>
          <p class="mt-2">Завантаження поста...</p>
        </div>
        
        <!-- Помилка завантаження -->
        <div v-else-if="error" class="alert alert-danger text-center">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
          <div class="mt-3">
            <button @click="loadPost" class="btn btn-outline-danger me-2">
              Спробувати знову
            </button>
            <router-link to="/" class="btn btn-secondary">
              На головну
            </router-link>
          </div>
        </div>
        
        <!-- Пост -->
        <div v-else-if="post" class="post-detail">
          <article class="card mb-4">
            <div class="card-body">
              <header class="mb-4">
                <h1 class="card-title display-6 mb-3">{{ post.title }}</h1>
                <div class="post-meta d-flex flex-wrap align-items-center text-muted">
                  <span class="me-3">
                    <i class="bi bi-person-circle me-1"></i>
                    <strong>{{ post.author || post.authorName || 'Невідомий автор' }}</strong>
                  </span>
                  <span class="me-3">
                    <i class="bi bi-calendar me-1"></i>
                    {{ formatDate(post.createdAt || post.date) }}
                  </span>
                  <span v-if="post.id" class="me-3">
                    <i class="bi bi-hash me-1"></i>
                    ID: {{ post.id }}
                  </span>
                </div>
              </header>
              
              <div class="post-content">
                <p class="card-text fs-5 text-dark" style="white-space: pre-line; line-height: 1.7;">
                  {{ post.content }}
                </p>
              </div>
              
              <!-- Дії з постом (якщо потрібно) -->
              <footer class="post-actions mt-4 pt-3 border-top">
                <div class="d-flex justify-content-between align-items-center">
                  <div class="post-stats">
                    <span class="text-muted">
                      <i class="bi bi-eye me-1"></i>
                      Переглядів: <span class="fw-bold">{{ viewCount }}</span>
                    </span>
                  </div>
                  
                  <div class="share-buttons">
                    <button 
                      @click="sharePost" 
                      class="btn btn-outline-primary btn-sm me-2"
                      title="Поділитися постом"
                    >
                      <i class="bi bi-share me-1"></i>
                      Поділитися
                    </button>
                    
                    <!-- Кнопка редагування для автора -->
                    <button 
                      v-if="canEditPost" 
                      @click="editPost" 
                      class="btn btn-outline-success btn-sm"
                      title="Редагувати пост"
                    >
                      <i class="bi bi-pencil me-1"></i>
                      Редагувати
                    </button>
                  </div>
                </div>
              </footer>
            </div>
          </article>
          
          <!-- Компонент коментарів -->
          <PostComments :postId="postId" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import blogModel from '@/services/blogModel.js';
import PostComments from './PostComments.vue';

export default {
  name: 'PostDetail',
  components: {
    PostComments
  },
  data() {
    return {
      post: null,
      loading: true,
      error: '',
      viewCount: 1
    };
  },
  computed: {
    postId() {
      return this.$route.params.id;
    },
    
    canEditPost() {
      const currentUser = blogModel.getCurrentUser();
      return currentUser && this.post && (
        currentUser.id === this.post.authorId || 
        currentUser.email === this.post.author
      );
    }
  },
  created() {
    this.loadPost();
    this.incrementViewCount();
  },
  methods: {
    async loadPost() {
      this.loading = true;
      this.error = '';
      
      try {
        console.log('Завантаження поста з ID:', this.postId);
        
        const post = await blogModel.getPostById(this.postId);
        
        if (post) {
          this.post = post;
          console.log('Пост завантажено:', post);
          
          // Оновлюємо заголовок сторінки
          document.title = `${post.title} - Блог`;
        } else {
          this.error = 'Пост не знайдено';
        }
        
      } catch (error) {
        console.error('Помилка завантаження поста:', error);
        this.error = `Помилка завантаження поста: ${error.message}`;
      } finally {
        this.loading = false;
      }
    },
    
    goBack() {
      // Використовуємо історію браузера або перенаправляємо на головну
      if (window.history.length > 1) {
        this.$router.go(-1);
      } else {
        this.$router.push('/');
      }
    },
    
    editPost() {
      if (this.post && this.post.id) {
        this.$router.push(`/edit-post/${this.post.id}`);
      }
    },
    
    sharePost() {
      if (navigator.share && this.post) {
        navigator.share({
          title: this.post.title,
          text: this.post.content.substring(0, 200) + '...',
          url: window.location.href
        }).catch(err => {
          console.log('Помилка при діленні:', err);
          this.copyPostLink();
        });
      } else {
        this.copyPostLink();
      }
    },
    
    copyPostLink() {
      const url = window.location.href;
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          this.showNotification('Посилання скопійовано до буферу обміну!');
        }).catch(() => {
          this.fallbackCopyTextToClipboard(url);
        });
      } else {
        this.fallbackCopyTextToClipboard(url);
      }
    },
    
    fallbackCopyTextToClipboard(text) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        this.showNotification('Посилання скопійовано!');
      } catch (err) {
        console.error('Помилка копіювання:', err);
        this.showNotification('Не вдалося скопіювати посилання');
      }
      
      document.body.removeChild(textArea);
    },
    
    showNotification(message) {
      const notification = document.createElement('div');
      notification.className = 'alert alert-info position-fixed top-0 start-50 translate-middle-x mt-3';
      notification.style.zIndex = '9999';
      notification.innerHTML = `
        <i class="bi bi-info-circle me-2"></i>
        ${message}
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    },
    
    incrementViewCount() {
      // Симуляція збільшення кількості переглядів
      const viewKey = `post_${this.postId}_views`;
      const currentViews = parseInt(localStorage.getItem(viewKey) || '0');
      this.viewCount = currentViews + 1;
      localStorage.setItem(viewKey, this.viewCount.toString());
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Невідома дата';
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return 'Невідома дата';
        }
        
        const options = { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          weekday: 'long'
        };
        return date.toLocaleDateString('uk-UA', options);
      } catch (error) {
        console.error('Помилка форматування дати:', error);
        return 'Невідома дата';
      }
    }
  },
  
  watch: {
    '$route.params.id': {
      handler(newId) {
        if (newId && newId !== this.postId) {
          this.loadPost();
          this.incrementViewCount();
        }
      },
      immediate: false
    }
  },
  
  beforeDestroy() {
    // Відновлюємо оригінальний заголовок сторінки
    document.title = 'Блог';
  }
};
</script>

<style scoped>
.post-detail {
  margin-top: 0;
}

.card {
  border: none;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  overflow: hidden;
}

.card-body {
  padding: 2.5rem;
}

.card-title {
  color: #2c3e50;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 1.5rem;
}

.post-meta {
  font-size: 0.95rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: -0.5rem 0 1.5rem 0;
}

.post-meta span {
  white-space: nowrap;
}

.post-content {
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 2rem 0;
}

.post-actions {
  background-color: #f8f9fa;
  margin: 0 -2.5rem -2.5rem -2.5rem;
  padding: 1.5rem 2.5rem;
}

.post-stats {
  font-size: 0.9rem;
}

.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-outline-secondary {
  border-color: #6c757d;
  color: #6c757d;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

.btn-outline-primary:hover {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-outline-success:hover {
  background-color: #198754;
  border-color: #198754;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  border-color: #dc3545;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.alert {
  border-radius: 12px;
  border: none;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
}

/* Стилі для мобільних пристроїв */
@media (max-width: 768px) {
  .card-body {
    padding: 1.5rem;
  }
  
  .post-actions {
    margin: 0 -1.5rem -1.5rem -1.5rem;
    padding: 1.5rem;
  }
  
  .post-meta {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .post-meta span {
    margin-bottom: 0.5rem;
  }
  
  .d-flex.justify-content-between {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .share-buttons {
    margin-top: 1rem;
    width: 100%;
  }
  
  .share-buttons .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .display-6 {
    font-size: 1.75rem;
  }
}

/* Анімації */
.post-detail {
  animation: fadeInUp 0.5s ease-in-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>