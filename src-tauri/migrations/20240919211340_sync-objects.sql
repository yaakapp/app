CREATE TABLE sync_objects
(
    checksum   TEXT                               NOT NULL PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data       BLOB                               NOT NULL
);
