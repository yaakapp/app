# Yaak Network Toolkit

The most fun you'll ever have working with APIs.

## Common Commands

```sh
# Start dev app
npm run tauri-dev

# Migration commands
cd src-tauri
cargo sqlx migrate add <name>
cargo sqlx migrate run --database-url 'sqlite://db.sqlite?mode=rw'
cargo sqlx prepare --database-url 'sqlite://db.sqlite'
```
