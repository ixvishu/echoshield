import re

with open('d:\\Ecoshield\\dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

def replacer(match):
    s = match.group(0)
    try:
        # If the matched string was originally UTF-8 bytes incorrectly decoded as CP1252,
        # encoding it back to CP1252 and decoding as UTF-8 will recover the original UTF-8 string.
        fixed = s.encode('cp1252').decode('utf-8')
        return fixed
    except:
        return s

cp1252_chars = (
    '\u0080-\u00FF'
    '\u20AC\u201A\u0192\u201E\u2026\u2020\u2021\u02C6\u2030\u0160\u2039\u0152\u017D'
    '\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u02DC\u2122\u0161\u203A\u0153\u017E\u0178'
)
pattern = re.compile(f'[{cp1252_chars}]+')

# For safety, let's also specifically fix the ones we know for sure first, 
# to avoid any regex grouping edge cases
specific_fixes = {
    'â€¢': '•',
    'âš ï¸ ': '⚠️',
    'ðŸ“¡': '📡',
    'ðŸ“Š': '📊',
    'ðŸ’§': '💧',
    'ðŸ œï¸ ': '🚰',
    'ðŸŒ³': '🌳',
    'ðŸ“Œ': '📌',
    'ðŸš’': '🚒',
    'ðŸš‘': '🚑',
    'ðŸ›‘': '🛑',
    'ðŸ’¥': '💥',
    'ðŸŒŠ': '🌊',
    'ðŸŒ ': '🌡️',
    'ðŸ“ ': '📉',
    'ðŸ” ': '🔍',
    'ðŸŒ ': '🌍',
    'ðŸŒ‘': '🌑',
    'ðŸŒ•': '🌕',
    'ðŸ”—': '🔗',
    'ðŸš§': '🚧',
    'ðŸ‘¥': '👥',
    'ðŸ’¬': '💬'
}

for k, v in specific_fixes.items():
    content = content.replace(k, v)

# Then apply the regex for anything we missed
new_content = pattern.sub(replacer, content)

with open('d:\\Ecoshield\\dashboard.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Encoding fixes applied.")
