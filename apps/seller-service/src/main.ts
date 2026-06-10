import express from 'express';
import cookieparser from 'cookie-parser';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import router from './routes/seller-routes';
import './jobs/cron-job';

const app = express();
app.use(
  cors({
    origin: [
      'http://localhost:3001',
      'http://localhost:3000',
      'http://localhost:3002',
    ],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['set-cookie'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(cookieparser());

app.get('/seller-health', (req, res) => {
  res.send({ message: 'Welcome to seller-service!' });
});

app.use((req, res, next) => {
  console.log('headers cookie:', req.headers.cookie);
  console.log('cookies:', req.cookies);
  console.log(req.method, req.originalUrl);
  next();
});

app.use('/api', router);
app.use(errorMiddleware);
const port = process.env.PORT || 6003;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
