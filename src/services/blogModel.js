const BASE_URL = 'http://localhost:3001';

async function request(path, options = {}) {
  console.log('Відправляємо запит:', path, options);
  
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { 
        'Content-Type': 'application/json', 
        ...(options.headers || {}) 
      },
      ...options
    });

    console.log('Відповідь сервера:', response.status, response.statusText);

    if (!response.ok) {
      let message = `Помилка сервера: ${response.status}`;
      
      // Перевіряємо тип контенту перед парсингом
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const data = await response.json();
          console.log('Дані помилки від сервера:', data);
          if (data?.message) message = data.message;
        } catch (parseError) {
          console.log('Не вдалося розпарсити JSON відповідь помилки:', parseError);
        }
      } else {
        // Якщо відповідь не JSON, читаємо як текст
        try {
          const textResponse = await response.text();
          console.log('Текстова відповідь помилки:', textResponse.substring(0, 200));
          
          // Якщо це HTML помилка 404, це означає що ендпоінт не існує
          if (response.status === 404 && textResponse.includes('<')) {
            message = 'API ендпоінт не знайдено на сервері';
          }
        } catch (textError) {
          console.log('Не вдалося прочитати текстову відповідь:', textError);
        }
      }

      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    // Перевіряємо тип контенту перед парсингом JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      // Якщо не JSON, повертаємо текст
      const text = await response.text();
      console.warn('Отримано не-JSON відповідь:', text.substring(0, 200));
      return { success: false, message: 'Сервер повернув неочікуваний формат відповіді' };
    }
    
  } catch (fetchError) {
    console.error('Помилка при виконанні запиту:', fetchError);
    
    // Якщо це помилка мережі або сервер недоступний
    if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
      const networkError = new Error('Не вдалося підключитися до сервера. Перевірте, чи запущений сервер.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    
    throw fetchError;
  }
}

function saveUser(user) {
  console.log('Зберігаємо користувача в localStorage:', user);
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function getUser() {
  try {
    const userData = localStorage.getItem('currentUser');
    const user = userData ? JSON.parse(userData) : null;
    console.log('Отримано користувача з localStorage:', user);
    return user;
  } catch (error) {
    console.error('Помилка парсингу даних користувача з localStorage:', error);
    localStorage.removeItem('currentUser'); // Виправлено: було removeUser
    return null;
  }
}

function removeUser() {
  localStorage.removeItem('currentUser');
}

// In-memory storage for comments as fallback
const commentsStorage = new Map();

function getStoredComments(postId) {
  return commentsStorage.get(postId.toString()) || [];
}

function storeComment(postId, comment) {
  const postIdStr = postId.toString();
  const existingComments = commentsStorage.get(postIdStr) || [];
  const newComment = {
    id: Date.now(),
    ...comment,
    createdAt: new Date().toISOString()
  };
  existingComments.push(newComment);
  commentsStorage.set(postIdStr, existingComments);
  return newComment;
}

export default {
  async registerUser(userData) {
    try {
      const response = await request('/api/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      console.log('Відповідь від сервера при реєстрації:', response);
      return response;
    } catch (error) {
      console.error('Помилка реєстрації:', error);
      return { success: false, message: error.message || 'Помилка реєстрації' };
    }
  },

  async loginUser(email, password) {
    try {
      console.log('Спроба входу з даними:', { email, password });
      
      const result = await request('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      console.log('Відповідь сервера при вході:', result);

      if (result && result.success && result.user) {
        // Зберігаємо користувача (токен вже включений у об'єкт user)
        saveUser(result.user);
        console.log('Користувача збережено в localStorage:', result.user);
        
        // Увімкнути серверні коментарі при успішному логіні
        this.enableServerComments(true);
      }

      return result;
    } catch (error) {
      console.error('Помилка логіну:', error);
      return { success: false, message: error.message || 'Помилка авторизації' };
    }
  },

  getCurrentUser() {
    return getUser();
  },

  logoutUser() {
    removeUser();
    // Вимикаємо серверні коментарі при виході
    this.enableServerComments(false);
  },

  async addPost(postData) {
    const user = getUser();
    console.log('Користувач при спробі додати пост:', user);
    
    if (!user) {
      console.error('Не знайдено дані користувача в localStorage');
      throw new Error('Користувач не авторизований');
    }
    
    if (!user.token) {
      console.error('Токен не знайдено в даних користувача:', user);
      throw new Error('Токен авторизації відсутній');
    }

    try {
      console.log('Відправляємо запит на додавання поста з токеном:', user.token);
      
      // Додаємо інформацію про автора до поста
      const postWithAuthor = {
        ...postData,
        author: user.name || user.username || user.email || 'Невідомий користувач',
        authorName: user.name || user.username || user.email,
        authorId: user.id,
        createdAt: new Date().toISOString()
      };
      
      console.log('Дані поста для відправки:', postWithAuthor);
      
      const result = await request('/api/posts', {
        method: 'POST',
        body: JSON.stringify(postWithAuthor),
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Відповідь сервера при додаванні поста:', result);
      return result;
    } catch (error) {
      console.error('Помилка додавання поста:', error);
      throw error;
    }
  },

  async getPosts() {
    try {
      return await request('/api/posts');
    } catch (error) {
      console.error('Помилка отримання постів:', error);
      return { posts: [], success: false, message: error.message };
    }
  },

  async getPostById(id) {
    try {
      const postsResponse = await this.getPosts();
      console.log('Пошук поста з ID:', id, 'в списку:', postsResponse);
      
      let post = null;
      
      if (postsResponse && postsResponse.posts) {
        post = postsResponse.posts.find(post => post.id == id); // Використовуємо == для порівняння різних типів
      } else if (Array.isArray(postsResponse)) {
        post = postsResponse.find(post => post.id == id);
      }
      
      if (post) {
        // Якщо автор не вказаний, спробуємо взяти з інших полів
        if (!post.author || post.author === 'Невідомий користувач') {
          post.author = post.authorName || post.userName || post.email || 'Невідомий автор';
        }
        
        console.log('Знайдений пост:', post);
      } else {
        console.warn('Пост з ID', id, 'не знайдено');
      }
      
      return post;
    } catch (error) {
      console.error('Помилка отrimання поста за ID:', error);
      return null;
    }
  },

  async addComment(postId, commentData) {
    const user = getUser();
    
    if (!user || !user.token) {
      throw new Error('Користувач не авторизований');
    }

    const commentWithAuthor = {
      ...commentData,
      author: user.name || user.email || user.username || 'Невідомий користувач',
      authorId: user.id,
      postId: postId,
      createdAt: new Date().toISOString()
    };

    console.log('Додавання коментаря:', commentWithAuthor);

    try {
      const result = await request(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify(commentWithAuthor),
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Коментар успішно додано на сервері:', result);
      return result;
    } catch (error) {
      console.error('Помилка додавання коментаря на сервер:', error);
      
      // Якщо сервер недоступний, зберігаємо локально як fallback
      if (error.isNetworkError) {
        console.warn('Сервер недоступний, зберігаємо коментар локально');
        const savedComment = storeComment(postId, commentWithAuthor);
        return {
          success: true,
          comment: savedComment,
          isLocal: true,
          message: 'Коментар збережено локально (сервер недоступний)'
        };
      }
      
      throw error;
    }
  },

  async getComments(postId) {
    console.log('Завантаження коментарів для поста:', postId);
    
    try {
      const result = await request(`/api/posts/${postId}/comments`);
      console.log('Отримані коментарі з сервера:', result);
      
      const serverComments = Array.isArray(result) ? result : (result?.comments || []);
      
      // Сортуємо коментарі за датою створення
      const sortedComments = serverComments.sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      
      console.log('Відсортовані коментарі:', sortedComments);
      return sortedComments;
      
    } catch (error) {
      console.error('Помилка завантаження коментарів з сервера:', error);
      
      // Якщо сервер недоступний, повертаємо локальні коментарі
      if (error.isNetworkError) {
        console.warn('Сервер недоступний, використовуємо локальні коментарі');
        const localComments = getStoredComments(postId);
        return localComments;
      }
      
      // Для інших помилок повертаємо порожній масив
      return [];
    }
  },

  // Утилітна функція для перевірки доступності сервера
  async checkServerHealth() {
    try {
      const response = await fetch(`${BASE_URL}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      console.error('Сервер недоступний:', error);
      return false;
    }
  },

  // Утилітна функція для очищення локальних коментарів
  clearLocalComments(postId = null) {
    if (postId) {
      commentsStorage.delete(postId.toString());
    } else {
      commentsStorage.clear();
    }
  },

  // Налаштування для коментарів
  commentsConfig: {
    useServer: true, // Тепер увімкнено по замовчуванню
    serverEndpointsReady: true
  },

  // Метод для перемикання режиму коментарів
  enableServerComments(enable = true) {
    this.commentsConfig.useServer = enable;
    this.commentsConfig.serverEndpointsReady = enable;
    console.log(`Серверні коментарі ${enable ? 'увімкнені' : 'вимкнені'}`);
  },

  // Утилітна функція для кращого налагодження
  debugInfo(postId = null) {
    console.log('=== Debug Info ===');
    console.log('Current user:', getUser());
    console.log('Comments config:', this.commentsConfig);
    
    if (postId) {
      console.log(`Local comments for post ${postId}:`, getStoredComments(postId));
    } else {
      console.log('All local comments:', Object.fromEntries(commentsStorage));
    }
    
    console.log('==================');
  }
};