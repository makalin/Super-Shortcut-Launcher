const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const store = new Store();
const path = require('path');

// Load saved shortcuts and theme
let shortcuts = store.get('shortcuts', []);
let isDarkTheme = store.get('darkTheme', true);
updateTheme();
renderShortcuts();

// Theme configurations
const themes = {
  dark: {
    background: 'rgba(40, 44, 52, 0.9)',
    buttonBackground: 'rgba(255, 255, 255, 0.1)',
    buttonHover: 'rgba(255, 255, 255, 0.2)',
    textColor: '#FFFFFF'
  },
  light: {
    background: 'rgba(255, 255, 255, 0.9)',
    buttonBackground: 'rgba(0, 0, 0, 0.1)',
    buttonHover: 'rgba(0, 0, 0, 0.2)',
    textColor: '#000000'
  }
};

function updateTheme() {
  const theme = isDarkTheme ? themes.dark : themes.light;
  document.body.style.backgroundColor = theme.background;
  document.body.style.color = theme.textColor;
  
  document.querySelectorAll('.shortcut').forEach(shortcut => {
    shortcut.style.backgroundColor = theme.buttonBackground;
  });

  store.set('darkTheme', isDarkTheme);
}

// Render shortcuts
function renderShortcuts() {
  const container = document.getElementById('shortcutContainer');
  container.innerHTML = '';

  shortcuts.forEach((shortcut, index) => {
    const shortcutEl = document.createElement('div');
    shortcutEl.className = 'shortcut';
    shortcutEl.title = path.basename(shortcut.path);
    shortcutEl.style.backgroundColor = isDarkTheme ? themes.dark.buttonBackground : themes.light.buttonBackground;
    
    const icon = document.createElement('img');
    icon.src = shortcut.customIcon || getIconForFile(shortcut.path);
    shortcutEl.appendChild(icon);
    
    shortcutEl.addEventListener('click', () => launchShortcut(shortcut.path));
    shortcutEl.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showShortcutMenu(shortcut, index);
    });
    
    container.appendChild(shortcutEl);
  });

  // Add the "+" button
  const addButton = document.createElement('div');
  addButton.className = 'shortcut add-button';
  addButton.innerHTML = '+';
  addButton.style.backgroundColor = isDarkTheme ? themes.dark.buttonBackground : themes.light.buttonBackground;
  addButton.addEventListener('click', addShortcut);
  container.appendChild(addButton);
}

// Show context menu for shortcuts
function showShortcutMenu(shortcut, index) {
  const menu = new Menu();
  menu.append(new MenuItem({
    label: 'Launch',
    click: () => launchShortcut(shortcut.path)
  }));
  menu.append(new MenuItem({
    label: 'Copy Path',
    click: () => ipcRenderer.send('copy-path', shortcut.path)
  }));
  menu.append(new MenuItem({
    label: 'Custom Icon',
    click: async () => {
      const iconPath = await ipcRenderer.invoke('select-icon');
      if (iconPath) {
        shortcuts[index].customIcon = iconPath;
        store.set('shortcuts', shortcuts);
        renderShortcuts();
      }
    }
  }));
  menu.append(new MenuItem({
    label: 'Remove',
    click: () => removeShortcut(index)
  }));
  menu.popup();
}

// Add new shortcut
async function addShortcut() {
  const filePath = await ipcRenderer.invoke('select-shortcut');
  if (filePath) {
    shortcuts.push({
      path: filePath,
      customIcon: null
    });
    store.set('shortcuts', shortcuts);
    renderShortcuts();
  }
}

// Remove shortcut
function removeShortcut(index) {
  shortcuts.splice(index, 1);
  store.set('shortcuts', shortcuts);
  renderShortcuts();
}

// Launch shortcut
function launchShortcut(path) {
  ipcRenderer.send('launch-shortcut', path);
}

// Get icon for file type
function getIconForFile(filepath) {
  const ext = path.extname(filepath).toLowerCase();
  switch (ext) {
    case '.exe':
      return './icons/app.png';
    case '.txt':
      return './icons/document.png';
    case '.sh':
    case '.bat':
      return './icons/script.png';
    default:
      return './icons/file.png';
  }
}

// Handle window dragging
let isDragging = false;
let startPosition = { x: 0, y: 0 };

document.addEventListener('mousedown', (e) => {
  isDragging = true;
  startPosition = { x: e.screenX, y: e.screenY };
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  
  const position = {
    x: e.screenX - startPosition.x,
    y: e.screenY - startPosition.y
  };
  
  ipcRenderer.send('save-position', position);
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// Theme toggling
ipcRenderer.on('toggle-theme', () => {
  isDarkTheme = !isDarkTheme;
  updateTheme();
  renderShortcuts();
});

// Preferences
ipcRenderer.on('open-preferences', () => {
  const modal = document.getElementById('preferencesModal');
  modal.classList.add('visible');
  document.getElementById('darkThemeToggle').checked = isDarkTheme;
});

function closePreferences() {
  document.getElementById('preferencesModal').classList.remove('visible');
}

document.getElementById('darkThemeToggle').addEventListener('change', (e) => {
  isDarkTheme = e.target.checked;
  updateTheme();
  renderShortcuts();
});

// Quit application
function quitApp() {
  ipcRenderer.send('quit-app');
}

// Handle clipboard paste
document.addEventListener('paste', (e) => {
  const pastedText = e.clipboardData.getData('text');
  if (pastedText && (pastedText.startsWith('file://') || path.isAbsolute(pastedText))) {
    const filePath = pastedText.replace('file://', '');
    shortcuts.push({
      path: filePath,
      customIcon: null
    });