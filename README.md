# yasp

Slideshow presenter: the backend serves one slideshow root directory (`*.yasp.json` definitions
plus their images), given as its command line argument, and the Vue frontend plays and edits them.

## Running

Everything runs in docker, driven by the docker-runner toolbelt shared with `~/git/naboo`
(`toolbelt/`, released from there: do not edit it here).

```bash
./docker-runner-local.sh   # local dev: backend (https 9810, debug 5006) + Vite dev server (9811)
./docker-runner-prod.sh    # b builds the war, D deploys it to srv, l follows its log
```

- **Local** (`docker-compose-local.yml`): the backend serves `gallery/iceland` and the frontend
  runs Vite over the mounted `frontend/`, so edits hot-reload. Both run as the host user. The
  certificates come from `certs/generate-local-cert.sh` (`--force` replaces the set).
- **Prod** (`docker-compose-prod.yml`): a single `application` container (the war, frontend
  included), deployed to the `yasp` user on srv (`toolbelt-deploy/prod/`), serving
  `~yasp/gallery`. It speaks plain HTTP on `127.0.0.1:9810` behind Caddy, which serves it as
  `https://balage-srv.ddns.net/yasp/` (`toolbelt-deploy/prod/yasp.caddy`). The frontend is built
  with a relative base and relative public-file links, so keep new ones without a leading `/`.
- Gradle needs **JDK 17** (the wrapper is 7.4.2); `.yasp.drconfig` (from the template) sets it.
