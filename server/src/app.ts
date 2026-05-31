import Fastify from 'fastify';

import { DocumentService } from './modules/docs/document.service';

const app = Fastify();

const documentService = new DocumentService();

const REPO_PATH = './repos/acme';

app.post('/docs/:docId', async (request, reply) => {
  const { docId } = request.params as {
    docId: string;
  };

  await documentService.createDocument(
    REPO_PATH,
    docId,
  );

  return {
    success: true,
  };
});

app.post(
  '/docs/:docId/blocks',
  async (request, reply) => {
    const { docId } = request.params as {
      docId: string;
    };

    const body = request.body as {
      parentId?: string | null;
    };

    const blockId =
      await documentService.createBlock(
        REPO_PATH,
        docId,
        body.parentId ?? null,
      );

    return {
      blockId,
    };
  },
);

app.put(
  '/docs/:docId/blocks/:blockId',
  async (request, reply) => {
    const { docId, blockId } =
      request.params as {
        docId: string;
        blockId: string;
      };

    const body = request.body as {
      content: string;
    };

    await documentService.updateBlock(
      REPO_PATH,
      docId,
      blockId,
      body.content,
    );

    return {
      success: true,
    };
  },
);

app.get('/docs/:docId', async (request, reply) => {
  const { docId } = request.params as {
    docId: string;
  };

  return documentService.loadDocument(
    REPO_PATH,
    docId,
  );
});

app.listen({
  port: 3000,
});