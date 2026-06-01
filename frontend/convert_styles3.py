import os
import glob
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content.replace("rgba(255,255,255,0.04)", "var(--glass-bg)")\
                         .replace("rgba(255,255,255,0.06)", "var(--glass-bg)")\
                         .replace("rgba(255,255,255,0.07)", "var(--glass-border)")\
                         .replace("rgba(255,255,255,0.08)", "var(--glass-border-strong)")\
                         .replace("rgba(255,255,255,0.09)", "var(--glass-border-strong)")\
                         .replace("rgba(255,255,255,0.1)", "var(--glass-border-strong)")\
                         .replace("rgba(255,255,255,0.15)", "var(--glass-border-strong)")\
                         .replace("rgba(255,255,255,0.2)", "var(--glass-border-strong)")

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))

print("Done phase 3")
