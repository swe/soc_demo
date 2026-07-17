# Telegram bot token — git history cleanup (deferred)

**Status:** Deferred until after M1 verification  
**Do not execute** this purge until clones and remotes are coordinated.

## Background

`app/api/send-message/route.ts` previously contained a hardcoded Telegram bot token and chat ID. The file was deleted from the working tree (commit `1c0727e`). The secret **remains recoverable from git history**.

CI uses a temporary allowlist in `.gitleaks.toml` for this exact historical value. That allowlist must be removed after a successful purge.

## Before any rewrite

1. **Revoke the bot token in BotFather** (and confirm the old token cannot send messages). History rewrite does not un-leak a live credential.
2. Inventory remotes, forks, and developer clones.
3. Announce a short push freeze on `master`.

## Purge steps (when approved)

1. Fresh clone of the repository.
2. Rewrite history to remove the leaked path and/or replace the token string across all commits (e.g. `git filter-repo --invert-paths --path app/api/send-message/route.ts`, or BFG Repo-Cleaner).
3. Force-push with lease to `origin` (and any other remotes) during the freeze.
4. Every developer **re-clones** or hard-resets to the rewritten history — old local refs still contain the secret.
5. Clear CI caches / old workflow artifacts that may retain checkouts.
6. Delete the temporary entry in `.gitleaks.toml`.
7. Run `gitleaks detect` with full history (`fetch-depth: 0`) and confirm zero matches.
8. Record internally: what leaked, when revoked, when purged.

## Risks

| Risk | Mitigation |
| --- | --- |
| Force-push breaks open PRs / local branches | Freeze; recreate PRs from rewritten base |
| Someone keeps an old clone | Mandatory re-clone; token already revoked |
| Forks retain history | Contact fork owners; delete org-controlled forks |
| Incomplete purge | Full-history gitleaks before removing allowlist |

## Success criteria

- Token revoked.
- Fresh clone of `origin/master` cannot surface the token.
- Gitleaks passes on full history with no temporary allowlist.
- Active developers are on rewritten history.
