"""공통 유틸리티 — Claude CLI subprocess 호출 + JSON 파싱"""
import subprocess
import json
import os
import shutil
import sys
import tempfile

# Windows에서 claude.cmd를 찾기 위해 정확한 경로 사용
CLAUDE_CMD = shutil.which("claude") or "claude"


def _get_clean_env():
    """CLAUDECODE 환경변수를 제거한 환경 반환 (중첩 세션 방지 우회)"""
    env = os.environ.copy()
    env.pop("CLAUDECODE", None)
    return env


def call_claude(prompt: str, timeout: int = 180) -> str:
    """Claude CLI를 subprocess로 호출하여 응답 텍스트 반환.

    긴 프롬프트는 임시 파일로 전달하여 명령줄 길이 제한을 회피.
    CLAUDECODE 환경변수를 제거하여 중첩 세션 제한을 우회.
    """
    env = _get_clean_env()

    # 항상 stdin으로 프롬프트 전달 (Windows 명령줄 인코딩/길이 문제 방지)
    result = subprocess.run(
        [CLAUDE_CMD, "--print", "-p", "-"],
        input=prompt,
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=timeout,
        env=env,
    )

    if result.returncode != 0:
        raise RuntimeError(f"Claude CLI 오류 (code {result.returncode}): {result.stderr}")

    output = result.stdout.strip()
    if not output:
        # stderr에 유용한 정보가 있을 수 있음
        raise RuntimeError(f"Claude CLI 빈 응답. stderr: {result.stderr}")

    return output


def parse_json_response(text: str) -> dict:
    """Claude 응답에서 JSON 블록을 추출하고 파싱.

    지원 형식:
    - ```json { ... } ```
    - ``` { ... } ```
    - 순수 JSON 텍스트
    """
    original = text  # 디버그용 보존

    # ```json ... ``` 블록 추출
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]

    text = text.strip()
    if not text:
        raise ValueError(f"JSON 파싱 실패 — 빈 결과. 원본 응답:\n{original[:500]}")

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # { 부터 마지막 } 까지 추출 시도
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(text[start:end])
        raise ValueError(f"JSON 파싱 실패. 원본 응답:\n{original[:500]}")
