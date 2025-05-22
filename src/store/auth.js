// store/auth.js
const state = () => ({
  user: null,
  token: null,
  isAuthenticated: false
});

const mutations = {
  setUser(state, user) {
    state.user = user;
  },
  setToken(state, token) {
    state.token = token;
  },
  setAuthenticated(state, status) {
    state.isAuthenticated = status;
  },
  clearAuth(state) {
    state.user = null;
    state.token = null;
    state.isAuthenticated = false;
  }
};

const actions = {
  checkAuth({ commit }) {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      commit('setToken', token);
      commit('setUser', JSON.parse(user));
      commit('setAuthenticated', true);
    } else {
      commit('clearAuth');
    }
  },

  loginUser({ commit }, { token, user }) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    commit('setToken', token);
    commit('setUser', user);
    commit('setAuthenticated', true);
  },

  logout({ commit }) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    commit('clearAuth');
  }
};

const getters = {
  isAuthenticated(state) {
    return state.isAuthenticated;
  },
  currentUser(state) {
    return state.user;
  },
  authToken(state) {
    return state.token;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
