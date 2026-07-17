# Telegram bot token — git history cleanup (completed)

**Status:** Completed 2026-07-17

## Background

`app/api/send-message/route.ts` previously contained a hardcoded Telegram bot token and chat ID. The file was deleted from the working tree, but the secret remained recoverable from git history. CI temporarily allowlisted the exact historical value in `.gitleaks.toml`.

## What was done (2026-07-17)

1. Safety backup taken before the rewrite (full-history git bundle; local `backup-before-history-cleanup` branch).
2. History rewritten with `git filter-repo`:
   - The token value was replaced with `[REDACTED]` in every historical blob (including the old `app/api/send-message/route.ts` and the former `.gitleaks.toml` allowlist).
   - `Co-authored-by` trailers referencing AI tools (Cursor / Codex / ChatGPT / OpenAI) were stripped from all commit messages. Human author and committer metadata was not modified.
3. Verified post-rewrite:
   - `git grep <token> $(git rev-list --all)` returns no matches.
   - `git log --all --format=%B | grep -i co-authored-by` returns no matches.
4. Temporary `.gitleaks.toml` allowlist deleted; full-history gitleaks now runs with no exceptions.
5. Rewritten history force-pushed to `origin/master` with `--force-with-lease`.

## Remaining operational follow-ups

- **Revoke the bot token in BotFather** if not already done — a history rewrite does not un-leak a live credential.
- Anyone with an old clone must re-clone or hard-reset; old local refs still contain the secret.
- Delete any remote backup refs or forks that retain pre-rewrite history once verification is complete.
- Clear CI caches / old workflow artifacts that may retain pre-rewrite checkouts.

## Success criteria

- [x] Fresh history cannot surface the token (`git grep` across all revs is clean).
- [x] Gitleaks passes on full history with no temporary allowlist.
- [ ] Token revoked in BotFather (operational step, outside the repository).
- [ ] Active developers are on rewritten history.
