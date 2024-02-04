CREATE TABLE grpc_requests
(
    id            TEXT                               NOT NULL
        PRIMARY KEY,
    model         TEXT     DEFAULT 'grpc_request'    NOT NULL,
    workspace_id  TEXT                               NOT NULL
        REFERENCES workspaces
            ON DELETE CASCADE,
    folder_id     TEXT                               NULL
        REFERENCES folders
            ON DELETE CASCADE,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name          TEXT                               NOT NULL,
    sort_priority REAL                               NOT NULL,
    url           TEXT                               NOT NULL,
    service       TEXT                               NULL,
    method        TEXT                               NULL,
    message       TEXT                               NOT NULL
);

CREATE TABLE grpc_connections
(
    id           TEXT                               NOT NULL
        PRIMARY KEY,
    model        TEXT     DEFAULT 'grpc_connection' NOT NULL,
    workspace_id TEXT                               NOT NULL
        REFERENCES workspaces
            ON DELETE CASCADE,
    request_id   TEXT                               NOT NULL
        REFERENCES grpc_requests
            ON DELETE CASCADE,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    service      TEXT                               NOT NULL,
    method       TEXT                               NOT NULL
);

CREATE TABLE grpc_messages
(
    id            TEXT                               NOT NULL
        PRIMARY KEY,
    model         TEXT     DEFAULT 'grpc_message'    NOT NULL,
    workspace_id  TEXT                               NOT NULL
        REFERENCES workspaces
            ON DELETE CASCADE,
    request_id    TEXT                               NOT NULL
        REFERENCES grpc_requests
            ON DELETE CASCADE,
    connection_id TEXT                               NOT NULL
        REFERENCES grpc_connections
            ON DELETE CASCADE,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_server     BOOLEAN                            NOT NULL,
    is_info       BOOLEAN                            NOT NULL,
    message       TEXT                               NOT NULL
);
