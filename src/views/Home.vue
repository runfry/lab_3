<template>
  <div class="row">
    <div class="col-md-8 mx-auto">
      <h2 class="text-center mb-4">Останні пости</h2>
      
      <!-- Показуємо індикатор завантаження -->
      <div v-if="loading" class="text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Завантаження...</span>
        </div>
        <p class="mt-2">Завантаження постів...</p>
      </div>
      
      <!-- Показуємо помилку, якщо вона є -->
      <div v-else-if="error" class="alert alert-danger text-center">
        <p>{{ error }}</p>
        <button @click="loadPosts" class="btn btn-outline-danger">Спробувати знову</button>
      </div>
      
      <!-- Показуємо повідомлення, якщо немає постів -->
      <div v-else-if="posts.length === 0" class="text-center">
        <div class="alert alert-info">
          <p>Ще немає постів. Будьте першим!</p>
        </div>
      </div>
      
      <!-- Показуємо список постів -->
      <div v-else>
        <div v-for="post in posts" :key="post.id" class="card mb-3 post-item">
          <div class="card-body">
            <h5 class="card-title">{{ post.title }}</h5>
            <p class="card-text">
              {{ truncateContent(post.content) }}
            </p>
            <div class="d-flex justify-content-between align-items-center">
              <router-link :to="'/post/' + post.id" class="btn btn-primary">Читати далі</router-link>
              <small class="text-muted">{{ formatDate(post.date || post.createdAt) }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import blogModel from '../services/blogModel'

export default {
  name: 'HomeView',
  data() {
    return {
      posts: [],
      loading: true,
      error: null
    }
  },
  created() {
    console.log('Home component created, loading posts...')
    this.loadPosts()
  },
  methods: {
    async loadPosts() {
      this.loading = true
      this.error = null
      
      try {
        console.log('Завантаження постів...')
        const response = await blogModel.getPosts()
        console.log('Отримана відповідь від API:', response)
        
        // Обробляємо різні варіанти структури відповіді
        if (response && response.posts && Array.isArray(response.posts)) {
          this.posts = response.posts
        } else if (Array.isArray(response)) {
          this.posts = response
        } else if (response && response.success && response.posts) {
          this.posts = response.posts
        } else {
          console.warn('Неочікувана структура відповіді:', response)
          this.posts = []
        }
        
        console.log('Оброблені пости:', this.posts)
        
        // Сортуємо пости за датою (найновіші спочатку)
        this.posts.sort((a, b) => {
          const dateA = new Date(a.date || a.createdAt || 0)
          const dateB = new Date(b.date || b.createdAt || 0)
          return dateB - dateA
        })
        
      } catch (error) {
        console.error('Помилка завантаження постів:', error)
        this.error = `Помилка завантаження постів: ${error.message}`
        this.posts = []
      } finally {
        this.loading = false
      }
    },
    
    truncateContent(content) {
      if (!content) return ''
      return content.length > 100 ? content.substr(0, 100) + '...' : content
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Невідома дата'
      
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) {
          return 'Невідома дата'
        }
        
        const options = { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
        return date.toLocaleDateString('uk-UA', options)
      } catch (error) {
        console.error('Error formatting date:', error)
        return 'Невідома дата'
      }
    }
  }
}
</script>

<style scoped>
.post-item {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.post-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.card-title {
  color: #333;
  font-weight: 600;
}

.card-text {
  color: #666;
  line-height: 1.6;
}

.btn-primary {
  border-radius: 4px;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.alert {
  border-radius: 8px;
}
</style>