import { app, BrowserWindow, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    title: "Universidad Puro Pollo",
    icon: path.join(__dirname, 'assets/icon.ico'), // Asegúrate de tener un icono aquí
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true, 
    },
    autoHideMenuBar: true,
  });

  // URL DE TU VPS (Frontend)
  const remoteURL = 'http://194.113.64.53:4001';
  
  // En desarrollo cargamos localhost:3000, en producción la IP del VPS
  const startURL = isDev ? 'http://localhost:3000' : remoteURL; 

  win.loadURL(startURL).catch(() => {
    console.log("Error al conectar con el servidor, reintentando...");
    setTimeout(() => win.loadURL(startURL), 5000);
  });

  // Maximizar al abrir (opcional)
  win.maximize();
}

app.whenReady().then(() => {
  // Ajuste de CORS y Headers
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    // Esto asegura que el Backend reconozca la petición como válida
    details.requestHeaders['Origin'] = 'http://194.113.64.53:4001'; 
    callback({ requestHeaders: details.requestHeaders });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});