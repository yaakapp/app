.PHONY: sqlx-prepare, dev

sqlx-prepare:
	cd src-tauri && cargo sqlx prepare --database-url 'sqlite://db.sqlite'

dev:
	npm run tauri-dev
