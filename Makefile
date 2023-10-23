.PHONY: sqlx-prepare

sqlx-prepare:
	cd src-tauri && cargo sqlx prepare --database-url 'sqlite://db.sqlite'
