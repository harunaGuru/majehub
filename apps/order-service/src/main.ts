import express from 'express';
import cookieparser from 'cookie-parser';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import router from './order/order-router';
import bodyParser from 'body-parser';
import { createOrder } from './controller/order-controller';

const app = express();

const allowedOrigins = [
  process.env.USER_UI_URL,
  process.env.SELLER_UI_URL,
  process.env.ADMIN_UI_URL,
];
app.use(
  cors({
    origin: allowedOrigins as string[],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['set-cookie'],
  })
);
app.use(
  '/api/create-order',
  bodyParser.raw({ type: 'application/json' }),
  (req, res, next) => {
    (req as any).rawBody = req.body;
    console.log('Order service hit');
    next();
  },
  createOrder
);

app.use(express.json());
app.use(cookieparser());

app.get('/order-health', (req, res) => {
  res.send({ message: 'Welcome to order-service!' });
});

app.use('/api', router);
app.use(errorMiddleware);

const port = process.env.PORT || 6005;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
