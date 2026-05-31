import Fastify from 'fastify';

import { DocsWebSocketServer } from './websocket/websocket.server';

const app = Fastify();

new DocsWebSocketServer();

app.listen({
  port: 3000,
});