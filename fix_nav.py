with open('d:\\Ecoshield\\Frontend\\src\\App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "'text-slate-400 hover:text-white hover:bg-slate-800/40'",
    "'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-slate-800/40 hover:bg-slate-100'"
)

with open('d:\\Ecoshield\\Frontend\\src\\App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Replaced remaining unselected nav links')
