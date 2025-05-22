import { createStore } from 'vuex';

export default createStore({
  state: {
    posts: JSON.parse(localStorage.getItem('blogPosts')) || [],
    users: JSON.parse(localStorage.getItem('blogUsers')) || [],
    currentUser: JSON.parse(localStorage.getItem('currentUser')) || null
  },
  getters: {
    isAuthenticated(state) {
      return state.currentUser !== null;
    },
    currentUser(state) {
      return state.currentUser;
    },
    getAllPosts(state) {
      return state.posts;
    },
    getPostById: (state) => (id) => {
      return state.posts.find(post => post.id === parseInt(id));
    }
  },
  mutations: {
    SET_CURRENT_USER(state, user) {
      state.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
    },
    LOGOUT(state) {
      state.currentUser = null;
      localStorage.removeItem('currentUser');
    },
    ADD_USER(state, user) {
      state.users.push(user);
      localStorage.setItem('blogUsers', JSON.stringify(state.users));
    },
    ADD_POST(state, post) {
      state.posts.unshift(post);
      localStorage.setItem('blogPosts', JSON.stringify(state.posts));
    }
  },
  actions: {
    registerUser({ commit, state }, userData) {
      if (state.users.some(user => user.email === userData.email)) {
        return { success: false, message: 'Користувач з таким email вже існує' };
      }
      commit('ADD_USER', userData);
      return { success: true };
    },
    loginUser({ commit, state }, { email, password }) {
      const user = state.users.find(user => user.email === email && user.password === password);
      if (user) {
        commit('SET_CURRENT_USER', user);
        return { success: true };
      }
      return { success: false, message: 'Невірний email або пароль' };
    },
    logoutUser({ commit }) {
      commit('LOGOUT');
    },
    addPost({ commit, state }, postData) {
      const newPost = {
        id: Date.now(),
        title: postData.title,
        content: postData.content,
        author: state.currentUser.email,
        date: new Date().toISOString(),
        comments: []
      };
      commit('ADD_POST', newPost);
      return newPost;
    },
    checkAuth({ commit }) {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (user) {
        commit('SET_CURRENT_USER', user);
        return { authenticated: true, user };
      } else {
        return { authenticated: false };
      }
    }
  }
});
