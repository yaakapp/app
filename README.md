# Yaak Network Toolkit

The most fun you'll ever have working with APIs.

## Common Commands

```sh
# Start dev app
npm run tauri-dev

# Migration commands
cd src-tauri
cargo sqlx migrate add ${MIGRATION_NAME}
cargo sqlx migrate run --database-url 'sqlite://db.sqlite?mode=rw'
cargo sqlx prepare --database-url 'sqlite://db.sqlite'
```

## Add App->Plugin API

- Add event in `events.rs`
- Add handler to `index.worker.ts`
