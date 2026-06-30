import base64
import io
import os

import anthropic
from pypdf import PdfReader, PdfWriter
from services.api_key import API_KEY

class PdfConverter:

    def __init__(self):
        self.client =  anthropic.Anthropic(api_key=API_KEY)  # ANTHROPIC_API_KEY 환경변수 사용

        # 변환 규칙(= system_prompt.md, 프론트매터 제거본)을 그대로 읽어 system으로 사용
        prompt_path = os.path.join(os.path.dirname(__file__), "system_prompt.md")
        with open(prompt_path, "r", encoding="utf-8") as f:
            SYSTEM_PROMPT_TEXT = f.read()
        
        self.MODEL = "claude-sonnet-4-6"
        self.SYSTEM = [
        {
            "type": "text",
            "text": SYSTEM_PROMPT_TEXT,
            "cache_control": {"type": "ephemeral"},
        }]
        self.USER_INSTRUCTION = "이 PDF를 변환 규칙대로 HancomEQN으로 변환해줘."

    def _pdf_block_from_bytes(self, pdf_bytes: bytes) -> dict:
        """PDF 바이트를 base64 document 블록으로 변환."""
        b64 = base64.standard_b64encode(pdf_bytes).decode("utf-8")
        return {
            "type": "document",
            "source": {
                "type": "base64",
                "media_type": "application/pdf",
                "data": b64,
            },
        }

    def _call(self, pdf_bytes: bytes, instruction: str = None) -> str:
        if instruction is None:
            instruction = self.USER_INSTRUCTION

        response = self.client.messages.create(
            model=self.MODEL,
            max_tokens=8192,
            system=self.SYSTEM,
            messages=[
                {
                    "role": "user",
                    "content": [
                        self._pdf_block_from_bytes(pdf_bytes),
                        {"type": "text", "text": instruction},
                    ],
                }
            ],
        )
        return "".join(block.text for block in response.content if block.type == "text")


    def convert_pdf(self, pdf_path: str) -> str:
        """짧은 PDF: 통째로 한 번에 변환."""
        with open(pdf_path, "rb") as f:
            return self._call(f.read())


    def convert_pdf_by_page(self, pdf_path: str, on_progress=None) -> str:
        """긴/수식 많은 PDF: 페이지 단위로 분할해 변환 후 병합.

        각 페이지를 단일 페이지 PDF로 떼어내 보내므로 이미지 변환 없이
        디지털 PDF의 텍스트 레이어가 유지된다. 실패한 페이지만 재시도하기 쉽다.
        """
        reader = PdfReader(pdf_path)
        total_pages = len(reader.pages)
        results = []

        for i, page in enumerate(reader.pages, start=1):
            # 한 페이지만 담은 PDF를 메모리에 생성
            writer = PdfWriter()
            writer.add_page(page)
            buf = io.BytesIO()
            writer.write(buf)
            page_bytes = buf.getvalue()

            try:
                text = self._call(page_bytes)
            except Exception as e:  # 네트워크/일시적 오류는 페이지 단위로 한 번 재시도
                text = self._call(page_bytes)

            results.append(text)

            if on_progress:
                on_progress(i, total_pages)

        return "\n\n".join(results)
    
    