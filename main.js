const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require("node:path");
const { BSON } = require('bson');
const fs = require('fs/promises');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 600,
        height: 620,
        autoHideMenuBar: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: false,
            preload: path.join(__dirname, "preload.js")
        }
    });

    ipcMain.on('select-output-dir', async () => {
        const result = await dialog.showOpenDialog(win, {
           properties: ['openDirectory']
        });

        if (!result.canceled) win.webContents.send('output-dir', result.filePaths[0]);
    });

    ipcMain.on('select-file', async () => {
        const result = await dialog.showOpenDialog(win, {
            properties: ['openFile', 'multiSelections'],
            filters: [
                {
                    name: "BSON File",
                    extensions: ['bson']
                }
            ]
        });

        if (!result.canceled) win.webContents.send('file-input', result.filePaths);
    });

    ipcMain.on("convert", async (event, args) => {
        let len = 0;
        for (const file of args.data.filesToConvert) {
            const data = await fs.readFile(file);
            const docs = [];

            let offset = 0;
            while (offset < data.length) {
                const docLength = data.readInt32LE(offset);
                const docBuffer = data.slice(offset, offset + docLength);
                const doc = BSON.deserialize(docBuffer);
                docs.push(doc);
                offset += docLength;
            }

            await fs.writeFile(path.join(args.data.outputDir, path.basename(file).replace('.bson', '.json')), JSON.stringify({_: docs}, null, 2));

            len += 1;
            win.webContents.send('progress', len);
        }
    });

    win.webContents.setWindowOpenHandler(({url}) => {
        shell.openExternal(url);
        return { action: "deny" };
    });

    win.loadFile('html/index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});
 
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});