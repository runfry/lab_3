<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <h2 class="text-center mb-4">
              <i class="bi bi-pencil-square me-2"></i>
              Редагувати пост
            </h2>
            
            <!-- Кнопка повернення -->
            <div class="mb-3">
              <button @click="goBack" class="btn btn-outline-secondary">
                <i class="bi bi-arrow-left me-2"></i>
                Повернутися
              </button>
            </div>
            
            <!-- Індикатор завантаження -->
            <div v-if="loading" class="text-center mb-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Завантаження...</span>
              </div>
              <p class="mt-2">Завантаження поста...</p>
            </div>
            
            <!-- Помилка завантаження -->
            <div v-else-if="loadError" class="alert alert-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{ loadError }}
              <div class="mt-2">
                <button @click="loadPost" class="btn btn-outline-danger btn-sm">
                  Спробувати знову
                </button>
              </div>
            </div>
            
            <!-- Форма редагування поста -->
            <form @submit.prevent="handleUpdatePost" novalidate v-else-if="post">
              <div class="mb-3">
                <label for="postTitle" class="form-label">
                  <i class="bi bi-card-heading me-1"></i>
                  Назва посту *
                </label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="postTitle"
                  v-model="post.title"
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
                  rows="10"
                  v-model="post.content"
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
              <div v-if="showPreview && post.title && post.content" class="mb-4">
                <div class="card bg-light">
                  <div class="card-header">
                    <h6 class="mb-0">
                      <i class="bi bi-eye me-1"></i>
                      Попередній перегляд
                    </h6>
                  </div>
                  <div class="card-body">
                    <h5 class="card-title">{{ post.title }}</h5>
                    <p class="card-text" style="white-space: pre-line;">{{ post.content }}</p>
                    <small class="text-muted">
                      <i class="bi bi-calendar me-1"></i>
                      Оновлено: {{ formatDate(new Date()) }}
                    </small>
                  </div>
                </div>
              </div>
              
              <!-- Кнопки -->
              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-success btn-lg"
                  :disabled="updating"
                >
                  <span v-if="updating" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <i v-else class="bi bi-check-circle me-2"></i>
                  {{ updating ? 'Збереження...' : 'Зберегти зміни' }}
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
                  class="btn btn-outline-warning"
                  @click="resetForm"
                  :disabled="updating"
                >
                  <i class="bi bi-arrow-clockwise me-2"></i>
                  Скинути зміни
                </button>
                
                <button 
                  type="button" 
                  class="btn btn-outline-danger"
                  @click="confirmDelete"
                  :disabled="updating"
                >
                  <i class="bi bi-trash me-2"></i>
                  Видалити пост
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Модальне вікно підтвердження видалення -->
  <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="deleteModalLabel">
            <i class="bi bi-exclamation-triangle me-2"></i>
            Підтвердження видалення
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>Ви впевнені, що хочете видалити цей пост?</p>
          <p><strong>"{{ post?.title }}"</strong></p>
          <p class="text-danger small">
            <i class="bi bi-exclamation-circle me-1"></i>
            Цю дію не можна буде скасувати!
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Скасувати
          </button>
          <button 
            type="button" 
            class="btn btn-danger"
            @click="deletePost"
            :disabled="deleting"
          >
            <span v-if="deleting" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i v-else class="bi bi-trash me-2"></i>
            {{ deleting ? 'Видалення...' : 'Видалити' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue3-toastify'
import axios from 'axios'

export default {
  name: 'EditPost',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const toast = useToast()
    
    // Стан компонента
    const loading = ref(false)
    const updating = ref(false)
    const deleting = ref(false)
    const loadError = ref('')
    const showPreview = ref(false)
    const post = ref(null)
    const originalPost = ref(null)
    
    // Помилки валідації
    const errors = reactive({
      title: '',
      content: ''
    })
    
    // ID поста з маршруту
    const postId = computed(() => route.params.id)
    
    // Завантаження поста
    const loadPost = async () => {
      loading.value = true
      loadError.value = ''
      
      try {
        const response = await axios.get(`/api/posts/${postId.value}`)
        post.value = { ...response.data }
        originalPost.value = { ...response.data }
      } catch (error) {
        console.error('Помилка завантаження поста:', error)
        loadError.value = error.response?.data?.message || 'Помилка завантаження поста'
      } finally {
        loading.value = false
      }
    }
    
    // Валідація форми
    const validateForm = () => {
      // Очищення попередніх помилок
      errors.title = ''
      errors.content = ''
      
      let isValid = true
      
      // Валідація назви
      if (!post.value.title || post.value.title.trim().length === 0) {
        errors.title = 'Назва поста обов\'язкова'
        isValid = false
      } else if (post.value.title.trim().length < 3) {
        errors.title = 'Назва повинна містити щонайменше 3 символи'
        isValid = false
      } else if (post.value.title.trim().length > 200) {
        errors.title = 'Назва не повинна перевищувати 200 символів'
        isValid = false
      }
      
      // Валідація контенту
      if (!post.value.content || post.value.content.trim().length === 0) {
        errors.content = 'Текст поста обов\'язковий'
        isValid = false
      } else if (post.value.content.trim().length < 10) {
        errors.content = 'Текст повинен містити щонайменше 10 символів'
        isValid = false
      } else if (post.value.content.trim().length > 5000) {
        errors.content = 'Текст не повинен перевищувати 5000 символів'
        isValid = false
      }
      
      return isValid
    }
    
    // Обробка оновлення поста
    const handleUpdatePost = async () => {
      if (!validateForm()) {
        toast.error('Будь ласка, виправте помилки у формі')
        return
      }
      
      updating.value = true
      
      try {
        const postData = {
          title: post.value.title.trim(),
          content: post.value.content.trim()
        }
        
        await axios.put(`/api/posts/${postId.value}`, postData)
        
        toast.success('Пост успішно оновлено!')
        router.push(`/posts/${postId.value}`)
      } catch (error) {
        console.error('Помилка оновлення поста:', error)
        
        if (error.response?.status === 422) {
          // Обробка помилок валідації з сервера
          const serverErrors = error.response.data.errors
          if (serverErrors) {
            Object.keys(serverErrors).forEach(field => {
              if (errors.hasOwnProperty(field)) {
                errors[field] = serverErrors[field][0]
              }
            })
          }
          toast.error('Помилки валідації форми')
        } else {
          toast.error(error.response?.data?.message || 'Помилка оновлення поста')
        }
      } finally {
        updating.value = false
      }
    }
    
    // Перемикання попереднього перегляду
    const togglePreview = () => {
      showPreview.value = !showPreview.value
    }
    
    // Скидання форми до початкового стану
    const resetForm = () => {
      if (originalPost.value) {
        post.value = { ...originalPost.value }
        
        // Очищення помилок
        errors.title = ''
        errors.content = ''
        
        toast.info('Форму скинуто до початкового стану')
      }
    }
    
    // Підтвердження видалення
    const confirmDelete = () => {
      const modal = new bootstrap.Modal(document.getElementById('deleteModal'))
      modal.show()
    }
    
    // Видалення поста
    const deletePost = async () => {
      deleting.value = true
      
      try {
        await axios.delete(`/api/posts/${postId.value}`)
        
        toast.success('Пост успішно видалено!')
        
        // Закриття модалки
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'))
        modal.hide()
        
        router.push('/posts')
      } catch (error) {
        console.error('Помилка видалення поста:', error)
        toast.error(error.response?.data?.message || 'Помилка видалення поста')
      } finally {
        deleting.value = false
      }
    }
    
    // Повернення назад
    const goBack = () => {
      router.go(-1)
    }
    
    // Форматування дати
    const formatDate = (date) => {
      return new Intl.DateTimeFormat('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    }
    
    // Завантаження поста при монтуванні компонента
    onMounted(() => {
      loadPost()
    })
    
    return {
      loading,
      updating,
      deleting,
      loadError,
      showPreview,
      post,
      errors,
      loadPost,
      handleUpdatePost,
      togglePreview,
      resetForm,
      confirmDelete,
      deletePost,
      goBack,
      formatDate
    }
  }
}
</script>

<style scoped>
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn {
  transition: all 0.15s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.bg-light {
  background-color: #f8f9fa !important;
}

.text-muted {
  color: #6c757d !important;
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.875em;
}

.form-text {
  color: #6c757d;
  font-size: 0.875em;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .card-body {
    padding: 1rem;
  }
}
</style>