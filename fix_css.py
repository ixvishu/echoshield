import re

with open('d:\\Ecoshield\\Frontend\\src\\index.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern: .bg-[#0b0f17] -> .bg-\[\#0b0f17\]
# Using regex to find class names starting with a dot, having word chars, a dash, and unescaped [#...]
# But wait, there are also /40, which might already be escaped like \/40
content = re.sub(r'\.([a-zA-Z0-9_-]+)-\[#([a-fA-F0-9]+)\]', r'.\1-\[\#\2\]', content)

with open('d:\\Ecoshield\\Frontend\\src\\index.css', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed unescaped CSS selectors.')
