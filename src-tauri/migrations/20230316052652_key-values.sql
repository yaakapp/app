CREATE TABLE key_values
(
    model      TEXT     NOT NULL DEFAULT 'key_value',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    namespace  TEXT     NOT NULL,
    key        TEXT     NOT NULL,
    value      TEXT     NOT NULL,

    PRIMARY KEY (namespace, key)
);
