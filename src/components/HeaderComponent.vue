<template>
  <header class="bg-dark py-3 text-white">
    <div class="container text-center">
      <div class="d-flex flex-column align-items-center">
        <img src="@/assets/logo.png" alt="Логотип" class="logo">
        <h1 class="mb-3">Мій блог</h1>
      </div>
      <nav>
        <router-link to="/" class="btn btn-primary mx-1">Головна</router-link>
        <router-link to="/add-post" class="btn btn-success mx-1">Додати пост</router-link> <!-- Кнопка завжди -->
        <router-link v-if="!isAuthenticated" to="/login" class="btn btn-secondary mx-1">Вхід</router-link>
        <router-link v-if="!isAuthenticated" to="/register" class="btn btn-info mx-1">Реєстрація</router-link>
        <router-link v-if="isAuthenticated" to="/profile" class="btn btn-danger mx-1">Профіль</router-link>
        <router-link to="/about" class="btn btn-warning mx-1">Про додаток</router-link>
      </nav>
    </div>
  </header>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'HeaderComponent',
  setup() {
    const store = useStore()
    const isAuthenticated = computed(() => store.getters.isAuthenticated)
    return { isAuthenticated }
  }
}
</script>
