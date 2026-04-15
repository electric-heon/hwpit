import sys
import io
import json
import tempfile
import os
from services.hwp_writer import HwpWriter

sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', line_buffering=True)

def handle_progress(line, total_lines):
    progress = (line / total_lines) * 100

    send_response({
        'type': 'progress',
        'value': progress
    })

def process_task(data):
    input_path = data['filePath']
    base_name = os.path.splitext(os.path.basename(input_path))[0] + '.hwp'
    temp_path = os.path.join(tempfile.gettempdir(), base_name)
    writer = HwpWriter()
    writer.write_hwp(input_path, temp_path, on_progress=handle_progress)

    return {'type': 'complete', 'tempPath': temp_path}

def send_response(data):
    print(json.dumps(data), flush=True)

def main():
    for line in sys.stdin:
        try:
            request = json.loads(line.strip())
            result = process_task(request)
            send_response(result)
        except Exception as e:
            send_response({'type': 'error', 'message': str(e)})

if __name__ == '__main__':
    main()