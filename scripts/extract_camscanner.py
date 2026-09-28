import os
import pypdf

dir_path = r'C:\Users\Hassaan\Downloads\Excel Markaz'
out_dir = r'C:\Users\Hassaan\.gemini\antigravity\scratch\financial-record-keeper\scripts\extracted_images'
os.makedirs(out_dir, exist_ok=True)

cam_files = ['CamScanner 19-09-2026 10.49.pdf', 'CamScanner 19-09-2026 10.50.pdf']

for cf in cam_files:
    p = os.path.join(dir_path, cf)
    reader = pypdf.PdfReader(p)
    print("Checking", cf, "pages:", len(reader.pages))
    for p_idx, page in enumerate(reader.pages):
        for img_idx, img in enumerate(page.images):
            img_name = f"{cf}_{p_idx}_{img_idx}_{img.name}"
            img_path = os.path.join(out_dir, img_name)
            with open(img_path, "wb") as fp:
                fp.write(img.data)
            print("Saved image:", img_path)
