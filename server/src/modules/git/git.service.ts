import simpleGit from 'simple-git';

export class GitService {
  async commit(repoPath: string, message: string) {
    const git = simpleGit(repoPath);

    await git.add('.');

    const status = await git.status();

    if (status.files.length === 0) {
      return;
    }

    await git.commit(message);
  }
}