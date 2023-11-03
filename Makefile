.PHONY: sqlx-prepare, dev, migrate, build

sqlx-prepare:
	cd src-tauri && cargo sqlx prepare --database-url 'sqlite://db.sqlite'

dev:
	npm run tauri-dev

migrate:
	cd src-tauri && cargo sqlx migrate run --database-url 'sqlite://db.sqlite?mode=rw'

build:
	./node_modules/.bin/tauri build
