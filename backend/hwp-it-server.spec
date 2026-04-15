# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['app\\main.py'],
    pathex=['app'],
    binaries=[],
    datas=[],
    hiddenimports=['pyhwpx', 'services.hwp_writer'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'PyQt6', 'PySide6', 'tkinter', '_tkinter',
        'unittest', 'doctest', 'pdb', 'pydoc',
        'ftplib', 'imaplib', 'mailbox', 'smtpd', 'smtplib', 'poplib', 'nntplib',
        'distutils', 'lib2to3', 'test', 'turtledemo',
        'scipy', 'matplotlib',
        'cv2', 'torch', 'tensorflow',
        'IPython', 'notebook', 'jupyter',
    ],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='hwp-it-server',
    debug=False,
    bootloader_ignore_signals=False,
    strip=True,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
