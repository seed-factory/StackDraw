# StackDraw - Isometric Diagramming Tool

[English](README.md) | [Русский](docs/README.ru.md) | [Deutsch](docs/README.de.md)

StackDraw is a powerful, open-source Progressive Web App (PWA) for creating beautiful isometric diagrams. Built with React and TypeScript, it runs entirely in your browser with offline support.

> Fork of [FossFLOW](https://github.com/stan-smith/FossFLOW) by @stan-smith, based on the [Isoflow](https://github.com/markmanx/isoflow) library by @markmanx

## Demo

**Try it now:** [https://seed-factory.github.io/StackDraw](https://seed-factory.github.io/StackDraw)

> **Recommended Browser:** For the best experience, we recommend using **Google Chrome** or other Chromium-based browsers (Edge, Brave, Opera). Some features like image export may have compatibility issues in Firefox.

## Features

- Isometric diagram creation with drag-and-drop interface
- Connectors with customizable labels and styles
- Multiple icon packs support (AWS, GCP, Azure, Kubernetes)
- Export to PNG, SVG, JSON
- PWA with offline support
- Multi-language interface (12+ languages)
- Session and server storage options
- Version history with Git backup (Docker)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/seed-factory/StackDraw
cd StackDraw

# Install dependencies
npm install

# Build the library (required first time)
npm run build:lib

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker

```bash
# Using Docker Compose (recommended)
docker compose up

# Or run directly with persistent storage
docker run -p 80:80 -v $(pwd)/diagrams:/data/diagrams stackdraw:latest

# Disable server storage
docker run -p 80:80 -e ENABLE_SERVER_STORAGE=false stackdraw:latest
```

## Project Structure

Monorepo with three packages:

- `packages/fossflow-lib` - React component library for drawing diagrams
- `packages/fossflow-app` - Progressive Web App wrapper
- `packages/fossflow-backend` - Node.js backend for server storage

### Commands

```bash
# Development
npm run dev          # Start app dev server
npm run dev:lib      # Watch mode for library

# Building
npm run build        # Build library and app
npm run build:lib    # Build library only
npm run build:app    # Build app only

# Testing
npm test             # Run unit tests
npm run lint         # Linting
```

## Usage

### Creating Diagrams

1. **Add Items**: Press "+" button, drag components from library to canvas
2. **Connect Items**: Select Connector tool (C), click nodes to connect
3. **Save**: Quick save to session or export as JSON

### Storage Options

- **Session Storage**: Temporary, cleared on browser close
- **Export/Import**: Permanent JSON files
- **Server Storage**: Persistent with version history (Docker)

## Roadmap

See [STACKDRAW_TODO.md](STACKDRAW_TODO.md) for planned features:

- Improved animations
- Custom icon pack
- GIF/WebM export

## Contributing

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT
