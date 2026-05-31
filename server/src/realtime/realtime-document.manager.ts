import { DocumentService } from '../modules/docs/document.service';

interface RealtimeBlockState {
  blockId: string;

  content: string;

  lockOwner: string | null;

  updatedAt: number;
}

interface RealtimeDocumentState {
  docId: string;

  blocks: Map<string, RealtimeBlockState>;
}

export class RealtimeDocumentManager {
  private readonly documents =
    new Map<string, RealtimeDocumentState>();

  constructor(
    private readonly documentService =
      new DocumentService(),
  ) {}

  async loadDocument(
    repoPath: string,
    docId: string,
  ) {
    const existing = this.documents.get(docId);

    if (existing) {
      return existing;
    }

    const document =
      await this.documentService.loadDocument(
        repoPath,
        docId,
      );

  const blocks = new Map();

    for (const block of document.blocks) {
      blocks.set(block.id, {
        blockId: block.id,
        content: block.content,
        lockOwner: null,
        updatedAt: Date.now(),
      });
    }

    const state: RealtimeDocumentState = {
      docId,
      blocks,
    };

    this.documents.set(docId, state);

    return state;
  }

  getBlock(
    docId: string,
    blockId: string,
  ) {
    return this.documents
      .get(docId)
      ?.blocks.get(blockId);
  }

  updateBlock(
    docId: string,
    blockId: string,
    content: string,
  ) {
    const block = this.documents
      .get(docId)
      ?.blocks.get(blockId);

    if (!block) {
      throw new Error('BLOCK_NOT_FOUND');
    }

    block.content = content;

    block.updatedAt = Date.now();
  }
}