import express from 'express';
import cookieparser from 'cookie-parser';
import cors from 'cors';
import recommendationRoutes from './routes/recomdation-routes';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['set-cookie'],
  })
);
app.use(cookieparser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/recommendation-message', (req, res) => {
  res.send({ message: 'Welcome to recommendation-service!' });
});

app.use((req, res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});
app.use('/api', recommendationRoutes);
app.use(errorMiddleware);
const port = process.env.PORT || 6009;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
