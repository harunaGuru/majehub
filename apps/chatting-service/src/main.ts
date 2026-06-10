import express from 'express';
import http from 'http';
import { initWebSocketServer } from './wsServer';
import { startConsumer } from './kafkaConsumer';
import router from './route/chatting-routes';
import cors from 'cors';
import cookieparser from 'cookie-parser';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';

const app = express();
const server = http.createServer(app);
app.use(
  cors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
    exposedHeaders: ['set-cookie'],
  })
);

// Initialize Kafka consumer
startConsumer();

// Initialize WebSocket server
initWebSocketServer(server);

app.use(express.json());
app.use(cookieparser());

app.get('/chatting-message', (req, res) => {
  res.send({ message: 'Welcome to chatting-service!' });
});
app.use('/api', router);
app.use(errorMiddleware);

const port = process.env.PORT || 6007;
server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/chatting-message`);
});
server.on('error', console.error);
