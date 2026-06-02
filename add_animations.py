import re

file_path = 'd:\\Ecoshield\\dashboard.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add hover-scale and fade-in to theme-card (mainly dashboard widgets)
content = content.replace('className="theme-card ', 'className="theme-card animate-fade-in-up hover-scale ')

# Add fade-in-up to glass-card
content = content.replace('className="glass-card ', 'className="glass-card animate-fade-in-up ')

# Add fade-in to the large KPI values
content = content.replace('className="text-2xl font-extrabold', 'className="text-2xl font-extrabold animate-fade-in')

# Add fade-in-up to sidebar buttons
content = content.replace('className={`flex items-center gap-3', 'className={`animate-fade-in-up flex items-center gap-3')

# Add fade-in and hover-scale to theme-chip
content = content.replace('className="theme-chip ', 'className="theme-chip hover-scale ')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
