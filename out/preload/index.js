"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  getStatus: () => electron.ipcRenderer.invoke("get-status"),
  onStatusUpdate: (callback) => {
    const handler = (_event, status) => {
      callback(status);
    };
    electron.ipcRenderer.on("status-update", handler);
    return () => {
      electron.ipcRenderer.removeListener("status-update", handler);
    };
  },
  startDrag: () => {
    electron.ipcRenderer.send("start-drag");
  }
});
