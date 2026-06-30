import sys
import io
import json
import tempfile
import os
from services.hwp_writer import HwpWriter
from services.pdf_converter import PdfConverter

sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', line_buffering=True)

converter = PdfConverter()

def make_progress_handler(phase):
    def handle_progress(current, total):
        send_response({
            'type': 'progress',
            'phase': phase,
            'value': (current / total) * 100
        })
    return handle_progress

def process_task(data):
    input_path = data['filePath']
    content = converter.convert_pdf_by_page(
        input_path, on_progress=make_progress_handler('pdf'))

    base_name = os.path.splitext(os.path.basename(input_path))[0] + '.hwp'
    temp_path = os.path.join(tempfile.gettempdir(), base_name)

    writer = HwpWriter()
    writer.write_hwp(content, temp_path, on_progress=make_progress_handler('hwp'))

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