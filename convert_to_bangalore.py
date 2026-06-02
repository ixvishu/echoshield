import os
import re

directories = ['d:\\Ecoshield\\Frontend\\src', 'd:\\Ecoshield\\Backend']

replacements = {
    'Patna': 'Bangalore',
    'Bihar': 'Karnataka',
    'Ganges': 'Bellandur',
    'Danapur': 'Whitefield',
    'Kankarbagh': 'Koramangala',
    'PMCH': 'Victoria',
    'Boring Road': 'MG Road'
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        new_content = new_content.replace(old.lower(), new.lower())
        new_content = new_content.replace(old.upper(), new.upper())

    # Replace coordinates
    # Patna is ~25.x, 85.x
    # Bangalore is ~12.x, 77.x
    # Replace anything matching 25.\d{3} with 12.\d{3} (keeping the decimals for simplicity)
    # Replace anything matching 85.\d{3} with 77.\d{3}
    
    def repl_lat(m):
        return '12.' + m.group(1)
    
    def repl_lng(m):
        return '77.' + m.group(1)

    new_content = re.sub(r'25\.(\d{2,3})', repl_lat, new_content)
    new_content = re.sub(r'85\.(\d{2,3})', repl_lng, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for d in directories:
    for root, dirs, files in os.walk(d):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.py')):
                process_file(os.path.join(root, file))

print("Conversion to Bangalore completed.")
