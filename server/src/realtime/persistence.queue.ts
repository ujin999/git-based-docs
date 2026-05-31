/* TODO: 이 부분은 나중에 Redis로 교체하든, 조금 더 나은 큐를 사용해야 한다 */
// 소켓별 owned block만 flush하도록 변경해야 한다
// 내가 소유한 블록만 flush하도록 변경해야 한다
import { DocumentService } from '../modules/docs/document.service';

interface PendingPersist {
  repoPath: string;

  docId: string;

  blockId: string;

  content: string;

  timer: NodeJS.Timeout;
}

export class PersistenceQueue {
  private readonly pending =
    new Map<string, PendingPersist>();

  constructor(
    private readonly documentService =
      new DocumentService(),
  ) {}

  schedule(
    repoPath: string,
    docId: string,
    blockId: string,
    content: string,
  ) {
    const key = `${docId}:${blockId}`;

    const existing =
      this.pending.get(key);

    if (existing) {
      clearTimeout(existing.timer);
    }

    const timer = setTimeout(async () => {
      await this.flush(key);
    }, 5000);

    this.pending.set(key, {
      repoPath,
      docId,
      blockId,
      content,
      timer,
    });

    console.log(
      '[persist]',
      docId,
      blockId,
    );
  }

  async flush(key: string) {
    const pending =
      this.pending.get(key);

    if (!pending) {
      return;
    }

    await this.documentService.updateBlock(
      pending.repoPath,
      pending.docId,
      pending.blockId,
      pending.content,
    );

    clearTimeout(pending.timer);

    this.pending.delete(key);
  }

  async flushDocument(docId: string) {
    const keys = [...this.pending.keys()];

    for (const key of keys) {
      if (key.startsWith(`${docId}:`)) {
        await this.flush(key);
      }
    }
  }
}