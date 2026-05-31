import fs from 'fs/promises';
import path from 'path';
import { DocumentMeta } from '../../types/document';

export class DocumentRepository {
  async loadMeta(
    repoPath: string,
    docId: string,
  ): Promise<DocumentMeta> {
    const metaPath = path.join(
      repoPath,
      'docs',
      docId,
      'meta.json',
    );

    const raw = await fs.readFile(metaPath, 'utf-8');

    return JSON.parse(raw);
  }

  async saveMeta(
    repoPath: string,
    docId: string,
    meta: DocumentMeta,
  ) {
    const metaPath = path.join(
      repoPath,
      'docs',
      docId,
      'meta.json',
    );

    await fs.writeFile(
      metaPath,
      JSON.stringify(meta, null, 2),
      'utf-8',
    );
  }

  async createDocument(
    repoPath: string,
    docId: string,
  ) {
    const docPath = path.join(
      repoPath,
      'docs',
      docId,
    );

    await fs.mkdir(
      path.join(docPath, 'blocks'),
      {
        recursive: true,
      },
    );

    const meta: DocumentMeta = {
      id: docId,
      rootBlocks: [],
      blocks: {},
    };

    await this.saveMeta(repoPath, docId, meta);
  }
}