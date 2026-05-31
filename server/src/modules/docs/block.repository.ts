import fs from 'fs/promises';
import path from 'path';

export class BlockRepository {
  async loadBlock(
    repoPath: string,
    docId: string,
    blockId: string,
  ) {
    const blockPath = path.join(
      repoPath,
      'docs',
      docId,
      'blocks',
      `${blockId}.md`,
    );

    return fs.readFile(blockPath, 'utf-8');
  }

  async saveBlock(
    repoPath: string,
    docId: string,
    blockId: string,
    content: string,
  ) {
    const blockPath = path.join(
      repoPath,
      'docs',
      docId,
      'blocks',
      `${blockId}.md`,
    );

    await fs.writeFile(blockPath, content, 'utf-8');
  }
}