import express from 'express';
import cookieparser from 'cookie-parser';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
const app = express();
import router from './routes/product-router';
import "./jobs/cron-job"
app.use(
  cors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['set-cookie'],
  })
);

app.use(express.json({limit:'10mb'}));
app.use(cookieparser());

app.get('/product-health', (req, res) => {
  res.send({ message: 'Welcome to product-service!' });
});
app.use((req, res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});

app.use('/api', router);
app.use(errorMiddleware);
const port = process.env.PORT || 6002;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
