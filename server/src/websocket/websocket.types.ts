export type ClientMessage =
  | JoinDocumentMessage
  | LockBlockMessage
  | UnlockBlockMessage
  | UpdateBlockMessage;

export interface JoinDocumentMessage {
  type: 'join_document';

  workspaceId: string;

  docId: string;

  userId: string;
}

export interface LockBlockMessage {
  type: 'lock_block';

  blockId: string;

  userId: string;
}

export interface UnlockBlockMessage {
  type: 'unlock_block';

  blockId: string;

  userId: string;
}

export interface UpdateBlockMessage {
  type: 'update_block';

  blockId: string;

  content: string;

  userId: string;
}