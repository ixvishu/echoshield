import re

app_path = 'd:\\Ecoshield\\Frontend\\src\\App.tsx'
with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    """) : (
{chatMessages.map((msg, i) => (""",
    """) : (
    <>
{chatMessages.map((msg, i) => ("""
)

content = content.replace(
    """)}\n              {chatMessages.length === 1 && (""",
    """)}\n              </>\n)}\n              {chatMessages.length === 1 && ("""
)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(content)
