import os
import re
import glob

def refactor():
    files = glob.glob('frontend/src/**/*.jsx', recursive=True)
    
    for filepath in files:
        with open(filepath, 'r') as f:
            content = f.read()

        new_content = content
        
        # Replace other hardcoded text colors 
        new_content = re.sub(r'\btext-slate-400\b', 'text-theme-muted', new_content)
        new_content = re.sub(r'\btext-slate-300\b', 'text-theme-muted', new_content)
        new_content = re.sub(r'\btext-gray-400\b', 'text-theme-muted', new_content)
        new_content = re.sub(r'\btext-gray-300\b', 'text-theme-muted', new_content)
        
        if new_content != content:
            with open(filepath, 'w') as f:
                f.write(new_content)
                
refactor()
print("Done")
