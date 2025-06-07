const { ipcRenderer, contextBridge } = require('electron');

process.once('loaded', () => {
    window.addEventListener('message', (event) => {
       if (event.data.type === 'select-output-dir') {
           ipcRenderer.send('select-output-dir');
       } else if (event.data.type === "select-file") {
           ipcRenderer.send("select-file");
       } else if (event.data.type === "convert") {
           ipcRenderer.send("convert", event.data);
       }
    });
});

contextBridge.exposeInMainWorld('electronAPI', {
    onOutputDir: (callback) => ipcRenderer.on("output-dir", (_event, value) => callback(value)),
    onFileInput: (callback) => ipcRenderer.on("file-input", (_event, value) => callback(value)),
    onProgress: (callback) => ipcRenderer.on("progress", (_event, value) => callback(value)),
});