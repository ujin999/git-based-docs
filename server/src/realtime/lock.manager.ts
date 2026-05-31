export class LockManager {
  private readonly locks =
    new Map<string, string>();

  private createKey(
    docId: string,
    blockId: string,
  ) {
    return `${docId}:${blockId}`;
  }

  acquire(
    docId: string,
    blockId: string,
    userId: string,
  ) {
    const key = this.createKey(
      docId,
      blockId,
    );

    const owner = this.locks.get(key);

    if (owner && owner !== userId) {
      return false;
    }

    this.locks.set(key, userId);

    return true;
  }

  release(
    docId: string,
    blockId: string,
    userId: string,
  ) {
    const key = this.createKey(
      docId,
      blockId,
    );

    const owner = this.locks.get(key);

    if (owner !== userId) {
      return false;
    }

    this.locks.delete(key);

    return true;
  }

  getOwner(
    docId: string,
    blockId: string,
  ) {
    return this.locks.get(
      this.createKey(docId, blockId),
    );
  }
}