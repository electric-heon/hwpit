import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let pythonProcess = null;
let pythonBuffer = '';

function createWindow() {
  const win = new BrowserWindow({
    minWidth: 650,
    minHeight: 500,
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden', 
    titleBarOverlay: {
      color: '#FBFAED',
      symbolColor: '#2C3016', 
      height: 35
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    },
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    win.loadURL('http://localhost:5173');
  }

  return win;
}

const startPython = (window) => {
  let pythonCmd, pythonArgs
  if (app.isPackaged) {
    pythonCmd = path.join(process.resourcesPath, 'hwp-it-server.exe')
    pythonArgs = []
  } else {
    pythonCmd = 'python'
    pythonArgs = [path.join(__dirname, '..', '..', 'backend', 'app', 'main.py')]
  }
  pythonProcess = spawn(pythonCmd, pythonArgs, {
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
  })

  pythonProcess.stdout.on('data', (data) => {
    pythonBuffer += data.toString()
    const lines = pythonBuffer.split('\n')

    pythonBuffer = lines.pop() || ''

    lines.forEach(async (line) => {
      if (line.trim()) {
        try {
          const result = JSON.parse(line)

          if (result.type === 'complete') {
            const tempPath = result.tempPath
            const defaultName = path.basename(tempPath)
            const saveResult = await dialog.showSaveDialog({
              title: '파일 저장',
              defaultPath: defaultName,
              filters: [{ name: 'HWP Files', extensions: ['hwp'] }]
            })

            try {
              if (!saveResult.canceled) {
                await fs.promises.copyFile(tempPath, saveResult.filePath)
              }
            } finally {
              await fs.promises.unlink(tempPath).catch(() => {})
            }

            window.webContents.send('python-result', { type: 'complete' })
          } else {
            window.webContents.send('python-result', result)
          }
        } catch (e) {
          console.error('Failed to parse JSON:', line, e)
        }
      }
    })
  })

  pythonProcess.stderr.on('data', (data) => {
    const msg = data.toString()
    console.error('Python Error', msg)
    window.webContents.send('python-result', { type: 'error', message: msg })
  })

  pythonProcess.on('error', (err) => {
    dialog.showErrorBox('백엔드 실행 오류', err.message)
  })

  pythonProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      dialog.showErrorBox('백엔드 종료', `프로세스가 코드 ${code}로 종료됐습니다.`)
    }
  })
}

ipcMain.handle('run-python-task', async (_event, filePath) => {
  pythonProcess.stdin.write(JSON.stringify({ filePath }) + '\n')
})

app.whenReady().then(() => {
  const win = createWindow()
  startPython(win)
})

app.on('quit', () => {
  if(pythonProcess) {
    pythonProcess.kill()
  }
})

app.on('window-all-closed', () => {
  app.quit()
})