export interface DocumentMeta {
  id: string;

  rootBlocks: string[];

  blocks: Record<string, BlockMeta>;
}

export interface BlockMeta {
  id: string;

  parentId: string | null;

  children: string[];

  type: string;
}