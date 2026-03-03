const { contextBridge, ipcRenderer } = require('electron');

// Exponemos una API segura al objeto 'window' del navegador
contextBridge.exposeInMainWorld('electronAPI', {
  // Información de la aplicación
  getAppVersion: () => '0.1.0',
  
  // Ejemplo: Enviar un evento al proceso principal (main.js)
  sendNotification: (message) => ipcRenderer.send('notify', message),
  
  // Manejo de eventos que vienen desde el proceso principal
  onDownloadProgress: (callback) => 
    ipcRenderer.on('download-progress', (event, value) => callback(value)),

  // Puedes añadir más funciones aquí si necesitas usar
  // funciones nativas de la computadora (como abrir carpetas)
});

console.log('--- Preload Script cargado correctamente ---');