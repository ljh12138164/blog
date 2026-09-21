#!/usr/bin/env python3
"""
Generate a clean, high-resolution 1200x630 branded Open Graph social share image.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "og-image.png"

W, H = 1200, 630
img = Image.new("RGB", (W, H), "#15191b")
draw = ImageDraw.Draw(img)

# Subtle ambient glow
for r in range(350, 0, -5):
    draw.ellipse([920 - r, 120 - r, 920 + r, 120 + r], fill=(18, 42, 42))

# Outer container card
draw.rounded_rectangle([48, 48, W - 48, H - 48], radius=24, outline="#262e33", width=2)

font_path = "C:/Windows/Fonts/msyh.ttc"
try:
    title_font = ImageFont.truetype(font_path, 64)
    subtitle_font = ImageFont.truetype(font_path, 28)
    tag_font = ImageFont.truetype(font_path, 20)
    footer_font = ImageFont.truetype(font_path, 24)
except OSError:
    title_font = subtitle_font = tag_font = footer_font = ImageFont.load_default()

# Tag pill
pill_box = [90, 96, 420, 140]
draw.rounded_rectangle(pill_box, radius=8, fill=(18, 38, 38), outline="#2dd4bf", width=1)
draw.text((106, 105), "FRONTEND NOTES & AI LAB", font=tag_font, fill="#2dd4bf")

# Main Title
draw.text((90, 175), "ljh的技术博客", font=title_font, fill="#fdfdfc")

# Subtitle (2 well-spaced lines, no chips, no overflow)
draw.text((90, 275), "专注前端架构设计 · 多人实时协同（CRDT/OT）", font=subtitle_font, fill="#cbd5e1")
draw.text((90, 325), "现代 Web 性能调优 · 全栈边缘计算与 AI 工程化实践", font=subtitle_font, fill="#94a3b8")

# Divider line
draw.line([90, 440, W - 90, 440], fill="#262e33", width=1)

# Footer info
draw.text((90, 485), "李建辉 (ljh) · 前端架构师 / 全栈开发者", font=footer_font, fill="#64748b")

url_text = "https://blog.ljhboard.cn"
url_bbox = draw.textbbox((0, 0), url_text, font=footer_font)
url_w = url_bbox[2] - url_bbox[0]
draw.text((W - 90 - url_w, 485), url_text, font=footer_font, fill="#2dd4bf")

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUTPUT, "PNG")

print(f"Successfully generated {OUTPUT}")
