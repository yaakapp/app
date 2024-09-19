## Developer Setup

Development requires the following tools

- [Node.js](https://nodejs.org/en/download/package-manager)
- [Rust](https://www.rust-lang.org/tools/install)

Then, you can run the app.

1. Checkout the [plugins](https://github.com/yaakapp/plugins) repository
2. Run `YAAK_PLUGINS_DIR="..." npm run build` to generate an icon, fetch external binaries, and build local JS dependencies
3. Run the desktop app in dev mode `npm start`

## SQLite Migrations

1. From `src-tauri/`, run `sqlx migrate add migration-name`
2. Migrate the DB by running the app (may need to `cargo clean` first)

_Note: Yaak development builds use a separate database location than production releases_
