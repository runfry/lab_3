<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <HeaderComponent />

    <main class="container my-4 flex-grow-1">
      <router-view />
    </main>

    <FooterComponent />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import HeaderComponent from '@/components/HeaderComponent.vue';
import FooterComponent from '@/components/FooterComponent.vue';

export default {
  name: 'App',
  components: {
    HeaderComponent,
    FooterComponent
  },
  methods: {
    ...mapActions(['checkAuth'])
  },
  created() {
    this.checkAuth();
  }
}
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  background-color: #fdfdfd;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Fade transition (optional) */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
