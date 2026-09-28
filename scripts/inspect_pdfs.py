import os
import pypdf

dir_path = r'C:\Users\Hassaan\Downloads\Excel Markaz'
for f in os.listdir(dir_path):
    if f.lower().endswith('.pdf'):
        p = os.path.join(dir_path, f)
        print("="*60)
        print("PDF FILE:", f)
        try:
            reader = pypdf.PdfReader(p)
            print(f"Num pages: {len(reader.pages)}")
            for idx, page in enumerate(reader.pages):
                txt = page.extract_text()
                print(f"--- Page {idx+1} (Text length: {len(txt) if txt else 0}) ---")
                if txt and txt.strip():
                    print(txt[:1000])
                else:
                    print("[No extractable text - likely scanned images]")
        except Exception as e:
            print("Error reading PDF:", e)
