import os
import re

directories = ['d:\\Ecoshield\\Frontend\\src']

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    
    # We want to add 0.34 to lat and 0.48 to lng.
    # Latitudes are typically 12.5xx to 12.6xx
    # Longitudes are typically 77.0xx to 77.1xx
    
    # Find all float arrays like [12.63, 77.11] or lat: 12.605, lng: 77.125
    # Let's replace 12.\d+ and 77.\d+
    
    def repl_lat(m):
        val = float(m.group(0))
        # Ensure we only shift coordinates that are around Maddur
        if 12.5 < val < 12.7:
            return f"{val + 0.34:.3f}"
        return m.group(0)
        
    def repl_lng(m):
        val = float(m.group(0))
        if 77.0 < val < 77.2:
            return f"{val + 0.48:.3f}"
        return m.group(0)

    # Regex for floats starting with 12. and 77.
    new_content = re.sub(r'12\.\d+', repl_lat, new_content)
    new_content = re.sub(r'77\.\d+', repl_lng, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for d in directories:
    for root, dirs, files in os.walk(d):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                process_file(os.path.join(root, file))

print("Coordinates shifted to true Bangalore.")
