const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  runPythonTask:          (filePath)  => ipcRenderer.invoke('run-python-task', filePath),
  onProgress:             (callback)  => ipcRenderer.on('python-result', (_, data) => callback(data)),
  removeProgrssListener:  ()          => ipcRenderer.removeAllListeners('python-result'),
  getFilePath:            (file)      => webUtils.getPathForFile(file)
});