import express from 'express';
import cookieparser from 'cookie-parser';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import router from './routes/admin-router';

const app = express();

const allowedOrigins = [
  process.env.USER_UI_URL,
  process.env.SELLER_UI_URL,
  process.env.ADMIN_UI_URL,
];
app.use(
  cors({
    origin: allowedOrigins as string[],
    credentials: true,
    exposedHeaders: ['set-cookie'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieparser());

app.get('/admin-message', (req, res) => {
  res.send({ message: 'Welcome to admin-service!' });
});

app.use('/api', router);
app.use(errorMiddleware);

const port = process.env.PORT || 6006;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
