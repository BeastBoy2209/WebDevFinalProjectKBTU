import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { req as reqHandler } from './dist/server/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 4000;
const browserDist = join(__dirname, 'dist/browser');

app.use(express.static(browserDist));

// Добавляем поддержку наших маршрутов для SSR
const routes = [
  '/login',
  '/register',
  '/swipe',
  '/profile',
  '/my-events',
  '/random-events',
  '/badges'
];

// Для API запросов
app.use('/api', (req, res) => {
  res.redirect('http://localhost:8000/api' + req.url);
});

// Для каждого маршрута добавляем обработчик
routes.forEach(route => {
  app.get(route, (req, res) => {
    reqHandler(req, res);
  });
});

// Для корневого маршрута
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Для всех остальных маршрутов
app.get('*', (req, res) => {
  reqHandler(req, res);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
