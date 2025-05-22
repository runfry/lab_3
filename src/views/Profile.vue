<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-body">
          <h2 class="text-center mb-4">Мій профіль</h2>
          <div class="table-responsive" v-if="user">
            <table class="table table-bordered">
              <tbody>
                <tr>
                  <th>Ім'я</th>
                  <td>{{ user.name }}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{{ user.email }}</td>
                </tr>
                <tr>
                  <th>Пароль</th>
                  <td>********</td>
                </tr>
                <tr>
                  <th>Стать</th>
                  <td>{{ user.gender === 'male' ? 'Чоловіча' : 'Жіноча' }}</td>
                </tr>
                <tr>
                  <th>Дата народження</th>
                  <td>{{ formatDate(user.birthdate) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center">
            <p>Завантаження профілю...</p>
          </div>
          <div class="text-center mt-4">
            <button @click="handleLogout" class="btn btn-danger">Вийти</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'ProfileView',
  data() {
    return {
      user: null
    };
  },
  computed: {
    ...mapGetters(['currentUser'])
  },
  created() {
    this.loadUserProfile();
  },
  methods: {
    loadUserProfile() {
      if (!this.currentUser) {
        this.$router.push('/login');
        return;
      }
      this.user = this.currentUser;
    },
    formatDate(dateString) {
      if (!dateString) return 'Невідома дата';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return 'Невідома дата';
        }
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('uk-UA', options);
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'Невідома дата';
      }
    },
    handleLogout() {
      this.$store.dispatch('logoutUser');
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
/* Додаткові стилі, якщо потрібно */
</style>
