# Super Shortcut Launcher

A cross-platform desktop application built with Electron that provides quick access to your favorite files and applications. The launcher features a minimalist, draggable interface that stays on top of other windows for easy access.

## Features

- Minimal, transparent interface that stays on top of other windows
- Dark and light theme support
- Drag-and-drop functionality for adding shortcuts
- Custom icons for shortcuts
- System tray integration with quick access menu
- Cross-platform support (Windows, macOS, Linux)
- Clipboard support for quick shortcut addition
- Configurable preferences
- Position memory between sessions

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Building from Source

1. Clone the repository:
```bash
git clone https://github.com/makalin/Super-Shortcut-Launcher.git
cd Super-Shortcut-Launcher
```

2. Install dependencies:
```bash
npm install
```

3. Start the application in development mode:
```bash
npm start
```

4. Build the application for your platform:
```bash
npm run build
```

The built application will be available in the `dist` directory.

## Usage

### Adding Shortcuts

There are several ways to add shortcuts:
- Click the "+" button and select a file or application
- Drag and drop files onto the launcher
- Copy a file path and paste it into the launcher
- Use the File menu and select "Add Shortcut"

### Customizing Shortcuts

Right-click any shortcut to access the context menu with these options:
- Launch: Open the file or application
- Copy Path: Copy the file path to clipboard
- Custom Icon: Select a custom icon for the shortcut
- Remove: Delete the shortcut from the launcher

### Interface Controls

- Drag the launcher window to reposition it
- Click the system tray icon to show/hide the launcher
- Use the quit button (×) to close the application
- Access additional options through the application menu

### Preferences

Access preferences through:
- Edit menu → Preferences
- System tray icon context menu

Available settings include:
- Theme toggle (Dark/Light)
- Always on top option
- Window position memory

## Development

### Project Structure

```
super-shortcut-launcher/
├── main.js           # Main electron process
├── renderer.js       # Renderer process logic
├── index.html        # Application UI
├── package.json      # Project configuration
└── icons/           # Application icons
```

### Technologies Used

- Electron
- electron-store (for persistent storage)
- electron-context-menu
- Node.js standard libraries

### Building for Different Platforms

The application can be built for different platforms using electron-builder:

- Windows: Creates NSIS installer
- macOS: Creates .app bundle
- Linux: Creates AppImage

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Icon assets from [your-icon-source]
- Electron community for documentation and examples
- Contributors who help improve the application
