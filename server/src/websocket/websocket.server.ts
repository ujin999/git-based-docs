import { WebSocketServer } from 'ws';
import path from 'path';

import {
  ClientMessage,
} from './websocket.types';

import { RealtimeDocumentManager } from '../realtime/realtime-document.manager';
import { LockManager } from '../realtime/lock.manager';
import { PersistenceQueue } from '../realtime/persistence.queue';

const REPO_PATH = path.resolve(
  process.cwd(),
  'repos/acme',
);

export class DocsWebSocketServer {
  private readonly wss =
    new WebSocketServer({
      port: 3001,
    });

  private readonly realtimeManager =
    new RealtimeDocumentManager();

  private readonly lockManager =
    new LockManager();

  private readonly persistenceQueue =
    new PersistenceQueue();

  private readonly rooms =
    new Map<string, Set<any>>();

  constructor() {
    this.bootstrap();
  }

  private bootstrap() {
    this.wss.on('connection', (socket: any) => {
      let currentDocId: string | null = null;

      socket.on('message', async (raw: Buffer) => {
        const message: ClientMessage =
          JSON.parse(raw.toString());

        if (message.type === 'join_document') {
          currentDocId = message.docId;

          const room =
            this.rooms.get(message.docId)
            ?? new Set();

            room.add(socket);

          this.rooms.set(message.docId, room);

          const document =
            await this.realtimeManager.loadDocument(
              REPO_PATH,
              message.docId,
            );

          socket.send(
            JSON.stringify({
              type: 'document_loaded',
              document,
            }),
          );
        }

        if (message.type === 'lock_block') {
          const acquired =
            this.lockManager.acquire(
              currentDocId!,
              message.blockId,
              message.userId,
            );

          if (!acquired) {
            socket.send(
              JSON.stringify({
                type: 'lock_failed',
                blockId: message.blockId,
              }),
            );

            return;
          }

          this.broadcast(
            currentDocId!,
            {
              type: 'block_locked',
              blockId: message.blockId,
              userId: message.userId,
            },
          );
        }

        if (message.type === 'update_block') {
          const owner =
            this.lockManager.getOwner(
              currentDocId!,
              message.blockId,
            );

          if (owner !== message.userId) {
            return;
          }

          this.realtimeManager.updateBlock(
            currentDocId!,
            message.blockId,
            message.content,
          );

          this.persistenceQueue.schedule(
            REPO_PATH,
            currentDocId!,
            message.blockId,
            message.content,
          );

          this.broadcast(
            currentDocId!,
            {
              type: 'block_updated',
              blockId: message.blockId,
              content: message.content,
            },
          );

          console.log('[ws update]', message);
        }

        if (message.type === 'unlock_block') {
          this.lockManager.release(
            currentDocId!,
            message.blockId,
            message.userId,
          );

          this.broadcast(
            currentDocId!,
            {
              type: 'block_unlocked',
              blockId: message.blockId,
            },
          );
        }
      });

      // 소켓별 owned block만 flush하도록 변경해야 한다
      socket.on('close', async () => {
        if (!currentDocId) {
          return;
        }

        await this.persistenceQueue.flushDocument(
          currentDocId,
        );

        this.rooms
          .get(currentDocId)
          ?.delete(socket);
      });
    });
  }

  private broadcast(
    docId: string,
    payload: unknown,
  ) {
    const room = this.rooms.get(docId);

    if (!room) {
      return;
    }

    for (const socket of room) {
      socket.send(JSON.stringify(payload));
    }
  }
}