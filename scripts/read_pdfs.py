import sys
from pathlib import Path
import pypdf

def extract_text(pdf_path):
    try:
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return f"Error reading {pdf_path}: {e}"

files = [
    "/Users/juan/Documents/HostingArena/business-plan/pdfs/1-guia-tecnica.pdf",
    "/Users/juan/Documents/HostingArena/business-plan/pdfs/2-plan-negocio.pdf",
    "/Users/juan/Documents/HostingArena/business-plan/pdfs/3-resumen-ejecutivo.pdf",
    "/Users/juan/Documents/HostingArena/business-plan/pdfs/5-suplemento-completo.pdf"
]

for f in files:
    print(f"--- START OF {Path(f).name} ---")
    print(extract_text(f))
    print(f"--- END OF {Path(f).name} ---\n")
