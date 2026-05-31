import { v4 as uuid } from 'uuid';

import { BlockRepository } from './block.repository';
import { DocumentRepository } from './document.repository';
import { GitService } from '../git/git.service';

export class DocumentService {
  constructor(
    private readonly documentRepository =
      new DocumentRepository(),

    private readonly blockRepository =
      new BlockRepository(),

    private readonly gitService =
      new GitService(),
  ) {}

  async createDocument(
    repoPath: string,
    docId: string,
  ) {
    await this.documentRepository.createDocument(
      repoPath,
      docId,
    );

    await this.gitService.commit(
      repoPath,
      `create doc ${docId}`,
    );
  }

  async createBlock(
    repoPath: string,
    docId: string,
    parentId: string | null,
  ) {
    const meta = await this.documentRepository.loadMeta(
      repoPath,
      docId,
    );

    const blockId = uuid();

    meta.blocks[blockId] = {
      id: blockId,
      parentId,
      children: [],
      type: 'text',
    };

    if (parentId) {
      meta.blocks[parentId].children.push(blockId);
    } else {
      meta.rootBlocks.push(blockId);
    }

    await this.documentRepository.saveMeta(
      repoPath,
      docId,
      meta,
    );

    await this.blockRepository.saveBlock(
      repoPath,
      docId,
      blockId,
      '',
    );

    await this.gitService.commit(
      repoPath,
      `create block ${blockId}`,
    );

    return blockId;
  }

  async updateBlock(
    repoPath: string,
    docId: string,
    blockId: string,
    content: string,
  ) {
    await this.blockRepository.saveBlock(
      repoPath,
      docId,
      blockId,
      content,
    );

    await this.gitService.commit(
      repoPath,
      `update ${docId}/${blockId}`,
    );
  }

  async loadDocument(
    repoPath: string,
    docId: string,
  ) {
      const meta = await this.documentRepository.loadMeta(
        repoPath,
        docId,
      );

      const blocks = await Promise.all(
      Object.keys(meta.blocks).map(
        async (blockId) => {
          const content =
            await this.blockRepository.loadBlock(
              repoPath,
              docId,
              blockId,
            );

          return {
            id: blockId,
            content,
          };
        },
      ),
    );

    return {
      meta,
      blocks,
    };
  }
}