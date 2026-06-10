import express from 'express';
import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import { startLogConsumer } from "./logger-consumer";

const app = express();

const server = http.createServer(app);

const logWss = new WebSocketServer({
  noServer: true,
});

export const clients = new Set<WebSocket>();

server.on("upgrade", (request, socket, head) => {
  logWss.handleUpgrade(request, socket, head, (ws) => {
    logWss.emit("connection", ws, request);
  });
});

logWss.on("connection", (ws) => {
  console.log("Admin connected to logs");
  clients.add(ws);
  ws.on("close", () => {
    clients.delete(ws);
  });

});

server.listen(6008, () => {
  console.log("Logging service running on 6008");
});

startLogConsumer()