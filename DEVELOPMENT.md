### Developer Setup

#### Prerequisites

Make sure you have the following tools installed:

- [Node.js](https://nodejs.org/en/download/package-manager)
- [Rust](https://www.rust-lang.org/tools/install)

Check the installations with the following commands:
```bash
node -v
npm -v
rustc --version
```

#### Steps

1. **Clone the Plugins Repository**  
   Clone the [plugins repository](https://github.com/yaakapp/plugins) to your local machine:
   ```bash
   git clone https://github.com/yaakapp/plugins.git /path/to/your/plugins-directory
   ```

   For example:
   ```bash
   git clone https://github.com/yaakapp/plugins.git /Users/your-username/github/yaak/plugins
   ```

2. **Install Project Dependencies**  
   Go to your project's root directory and set the environment variable for the plugins directory:
   ```bash
   cd /path/to/your/project
   YAAK_PLUGINS_DIR="/path/to/your/plugins-directory" npm install
   ```

3. **Bootstrap the Project**  
   Run the bootstrap command to fetch external binaries and build local dependencies:
   ```bash
   YAAK_PLUGINS_DIR="/path/to/your/plugins-directory" npm run bootstrap
   ```

4. **Run the Application in Development Mode**  
   After bootstrapping, start the app in development mode:
   ```bash
   npm run app-dev
   ```

---

## SQLite Migrations

1. **Create a New Migration**  
   From the `src-tauri/` directory, run:
   ```bash
   cd src-tauri
   sqlx migrate add migration-name
   ```

2. **Apply the Migrations**  
   Run the app to apply the migrations. If needed, run:
   ```bash
   cargo clean
   npm run app-dev
   ```

_Note: Development builds use a separate database location from production builds._