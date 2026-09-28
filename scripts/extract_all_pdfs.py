import os
import sys
import pypdf

# Set standard output to UTF-8
sys.stdout.reconfigure(encoding='utf-8')

dir_path = r'C:\Users\Hassaan\Downloads\Excel Markaz'
for f in sorted(os.listdir(dir_path)):
    if f.lower().endswith('.pdf'):
        p = os.path.join(dir_path, f)
        print("="*70)
        print("PDF FILE:", repr(f))
        try:
            reader = pypdf.PdfReader(p)
            print(f"Num pages: {len(reader.pages)}")
            for idx, page in enumerate(reader.pages):
                txt = page.extract_text()
                print(f"--- Page {idx+1} ---")
                if txt and txt.strip():
                    print(txt)
                else:
                    print("[No extractable text - contains image]")
        except Exception as e:
            print("Error reading PDF:", e)
