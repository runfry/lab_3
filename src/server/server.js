import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

const USERS_FILE = './users.json';
const POSTS_FILE = './posts.json';
const COMMENTS_FILE = './comments.json';

// --- Функції для читання та запису JSON з обробкою помилок ---
function loadUsers() {
  try {
    if (!existsSync(USERS_FILE)) {
      console.log('Файл users.json не існує, створюємо новий');
      saveUsers([]);
      return [];
    }
    
    const data = readFileSync(USERS_FILE, 'utf-8').trim();
    if (!data) {
      console.log('Файл users.json порожній, ініціалізуємо');
      saveUsers([]);
      return [];
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Помилка читання users.json:', error.message);
    console.log('Створюємо новий файл users.json');
    saveUsers([]);
    return [];
  }
}

function saveUsers(users) {
  try {
    writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    console.log('Користувачі збережені успішно');
  } catch (error) {
    console.error('Помилка збереження users.json:', error.message);
  }
}

function loadPosts() {
  try {
    if (!existsSync(POSTS_FILE)) {
      console.log('Файл posts.json не існує, створюємо новий');
      savePosts([]);
      return [];
    }
    
    const data = readFileSync(POSTS_FILE, 'utf-8').trim();
    if (!data) {
      console.log('Файл posts.json порожній, ініціалізуємо');
      savePosts([]);
      return [];
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Помилка читання posts.json:', error.message);
    console.log('Створюємо новий файл posts.json');
    savePosts([]);
    return [];
  }
}

function savePosts(posts) {
  try {
    writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
    console.log('Пости збережені успішно');
  } catch (error) {
    console.error('Помилка збереження posts.json:', error.message);
  }
}

function loadComments() {
  try {
    if (!existsSync(COMMENTS_FILE)) {
      console.log('Файл comments.json не існує, створюємо новий');
      saveComments([]);
      return [];
    }
    
    const data = readFileSync(COMMENTS_FILE, 'utf-8').trim();
    if (!data) {
      console.log('Файл comments.json порожній, ініціалізуємо');
      saveComments([]);
      return [];
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Помилка читання comments.json:', error.message);
    console.log('Створюємо новий файл comments.json');
    saveComments([]);
    return [];
  }
}

function saveComments(comments) {
  try {
    writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));
    console.log('Коментарі збережені успішно');
  } catch (error) {
    console.error('Помилка збереження comments.json:', error.message);
  }
}

// --- Ініціалізація даних ---
let users = loadUsers();
let posts = loadPosts();
let comments = loadComments();

console.log(`Завантажено: ${users.length} користувачів, ${posts.length} постів, ${comments.length} коментарів`);

// --- Middleware авторизації ---
function authMiddleware(req, res, next) {
  console.log('Перевірка авторизації...');
  
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log('Відсутній заголовок Authorization');
    return res.status(401).json({ success: false, message: 'Користувач не авторизований' });
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    console.log('Невірний формат токена');
    return res.status(401).json({ success: false, message: 'Невірний формат токена авторизації' });
  }

  const token = authHeader.split(' ')[1];
  
  if (token !== 'fake-jwt-token') {
    console.log('Недійсний токен');
    return res.status(403).json({ success: false, message: 'Недійсний токен' });
  }

  console.log('Авторизація успішна');
  next();
}

// --- Функція для знаходження користувача за токеном ---
function getUserFromToken(token) {
  // В реальному додатку тут був би розбір JWT токена
  // Зараз просто повертаємо першого користувача як заглушку
  return users.length > 0 ? users[0] : null;
}

// --- ЕНДПОІНТИ ---

// Перевірка здоров'я сервера
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// --- Реєстрація ---
app.post('/api/register', (req, res) => {
  const { name, email, password, gender, birthdate } = req.body;
  console.log('Запит на реєстрацію:', { name, email, gender, birthdate });

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Не всі обов\'язкові поля заповнені' });
  }

  if (users.find(u => u.email === email)) {
    return res.status(409).json({ success: false, message: 'Користувач з таким email вже існує' });
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    gender: gender || '',
    birthdate: birthdate || '',
    registeredAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  console.log('Користувач зареєстрований:', { ...newUser, password: '[HIDDEN]' });

  res.status(201).json({ success: true, message: 'Користувача успішно зареєстровано' });
});

// --- Логін ---
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Спроба входу:', { email });

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Введіть email і пароль' });
  }

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    console.log('Невірні дані для входу');
    return res.status(401).json({ success: false, message: 'Невірний email або пароль' });
  }

  // Примітивний токен (можна замінити на JWT)
  const token = 'fake-jwt-token';
  
  // Створюємо копію користувача з токеном (без паролю)
  const userWithToken = { 
    id: user.id,
    name: user.name,
    email: user.email,
    gender: user.gender,
    birthdate: user.birthdate,
    registeredAt: user.registeredAt,
    token 
  };
  
  console.log('Користувач успішно увійшов:', userWithToken.email);

  res.json({
    success: true,
    token,
    user: userWithToken
  });
});

// --- Додати пост ---
app.post('/api/posts', authMiddleware, (req, res) => {
  const { title, content, author, authorName, authorId } = req.body;
  console.log('Спроба створити пост:', { title, author });

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Назва і текст посту обов\'язкові' });
  }

  const newPost = {
    id: Date.now(),
    title,
    content,
    author: author || 'Невідомий автор',
    authorName: authorName || author || 'Невідомий автор',
    authorId: authorId || null,
    createdAt: new Date().toISOString()
  };

  posts.push(newPost);
  savePosts(posts);
  console.log('Пост успішно створено:', { id: newPost.id, title: newPost.title, author: newPost.author });

  res.status(201).json({ success: true, message: 'Пост додано успішно', post: newPost });
});

// --- Отримати всі пости ---
app.get('/api/posts', (req, res) => {
  console.log('Запит на отримання всіх постів');
  res.json({ success: true, posts });
});

// --- Отримати пост за ID ---
app.get('/api/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  console.log('Запит на отримання поста з ID:', postId);
  
  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Пост не знайдено' });
  }
  
  res.json({ success: true, post });
});

// --- КОМЕНТАРІ ---

// Отримати коментарі для поста
app.get('/api/posts/:id/comments', (req, res) => {
  const postId = parseInt(req.params.id);
  console.log('Запит на отримання коментарів для поста:', postId);
  
  const postComments = comments.filter(c => c.postId === postId);
  console.log(`Знайдено ${postComments.length} коментарів для поста ${postId}`);
  
  res.json({ success: true, comments: postComments });
});

// Додати коментар до поста
app.post('/api/posts/:id/comments', authMiddleware, (req, res) => {
  const postId = parseInt(req.params.id);
  const { content, author, authorId } = req.body;
  
  console.log('Спроба додати коментар до поста:', postId, { author, content: content?.substring(0, 50) + '...' });

  if (!content) {
    return res.status(400).json({ success: false, message: 'Текст коментаря обов\'язковий' });
  }

  // Перевіряємо, чи існує пост
  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Пост не знайдено' });
  }

  const newComment = {
    id: Date.now(),
    postId: postId,
    content,
    author: author || 'Невідомий автор',
    authorId: authorId || null,
    createdAt: new Date().toISOString()
  };

  comments.push(newComment);
  saveComments(comments);
  
  console.log('Коментар успішно додано:', { id: newComment.id, author: newComment.author });

  res.status(201).json({ success: true, message: 'Коментар додано успішно', comment: newComment });
});

// --- Обробка помилок ---
app.use((err, req, res, next) => {
  console.error('Помилка сервера:', err);
  res.status(500).json({ success: false, message: 'Внутрішня помилка сервера' });
});

// --- Запуск сервера ---
app.listen(PORT, () => {
  console.log(`✅ Сервер запущено на http://localhost:${PORT}`);
  console.log(`📁 Файли даних:`);
  console.log(`   - Користувачі: ${USERS_FILE}`);
  console.log(`   - Пости: ${POSTS_FILE}`);
  console.log(`   - Коментарі: ${COMMENTS_FILE}`);
});