CREATE TABLE workspaces
(
    id          TEXT     NOT NULL PRIMARY KEY,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at  DATETIME,
    name        TEXT     NOT NULL,
    description TEXT     NOT NULL
);

CREATE TABLE requests
(
    id           TEXT     NOT NULL PRIMARY KEY,
    workspace_id TEXT     NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at   DATETIME,
    name         TEXT     NOT NULL,
    url          TEXT     NOT NULL,
    method       TEXT     NOT NULL,
    headers      TEXT     NOT NULL,
    body         TEXT
);

CREATE TABLE responses
(
    id            TEXT     NOT NULL PRIMARY KEY,
    request_id    TEXT     NOT NULL REFERENCES requests (id) ON DELETE CASCADE,
    workspace_id  TEXT     NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at    DATETIME,
    elapsed       INTEGER  NOT NULL,
    status        INTEGER  NOT NULL,
    status_reason TEXT     NOT NULL,
    body          TEXT     NOT NULL,
    headers       TEXT     NOT NULL
);
