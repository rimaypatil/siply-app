from rembg import remove
from PIL import Image
import os

input_path = "C:\\Users\\rimay\\.gemini\\antigravity\\brain\\ae9258f9-8c34-497f-a1e4-508038997b75\\cute_cat_water_3d_1766590963067.png"
output_path = "c:\\Users\\rimay\\OneDrive\\Desktop\\Water App\\public\\cute-cat-water.png"

try:
    print(f"Processing {input_path}...")
    inp = Image.open(input_path)
    output = remove(inp)
    output.save(output_path)
    print(f"Saved transparent image to {output_path}")
except Exception as e:
    print(f"Error: {e}")
