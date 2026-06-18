import express from 'express';
import cookieparser from 'cookie-parser';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import router from './routes/auth-router';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger-output.json';

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

app.use(express.json());
app.use(cookieparser());

app.get('/auth-message', (req, res) => {
  res.send({ message: 'Welcome to auth-service!' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/docs-json', (req, res) => {
  // res.setHeader('Content-Type', 'application/json');
  res.json(swaggerDocument);
});
app.use('/api', router);
app.use(errorMiddleware);

const port = process.env.PORT ? Number(process.env.PORT) : 6001;
const server = app.listen(port, () => {
  console.log(`Auth service is running at http://localhost:${port}/api`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs `);
});
server.on('error', console.error);
