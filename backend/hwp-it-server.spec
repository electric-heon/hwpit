# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['app\\main.py'],
    pathex=[],
    binaries=[],
    datas=[('app/services/system_prompt.md', 'services')],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # 앱이 실제로 import하지 않는데 PyInstaller가 optional import 체인으로 끌어온 대용량 패키지들
        'torch', 'torchvision', 'torchaudio', 'torchgen',
        'transformers', 'tokenizers', 'huggingface_hub', 'accelerate', 'safetensors',
        'scipy', 'sympy', 'mpmath',
        'matplotlib', 'networkx',
        'cv2', 'skimage', 'sklearn', 'tensorflow',
        'docling', 'docling_parse',
        'openpyxl', 'xlsxwriter',
        # 웹서버 스택 (main.py는 stdin/stdout으로 통신)
        'fastapi', 'uvicorn', 'starlette',
        # 개발/노트북 도구
        'jedi', 'IPython', 'ipykernel', 'nbformat', 'nbconvert', 'notebook',
        'jupyter_client', 'jupyter_core', 'prompt_toolkit', 'debugpy',
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
    strip=False,
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
