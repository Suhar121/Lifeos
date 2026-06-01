import os
import re
import glob

def refactor():
    files = glob.glob('frontend/src/**/*.jsx', recursive=True)
    
    for filepath in files:
        with open(filepath, 'r') as f:
            content = f.read()

        new_content = content
        
        # Replace inline styles for glass panels
        new_content = re.sub(
            r"background:\s*'rgba\(255,255,255,0\.0[3456]\)'", 
            r"background:'var(--glass-bg)'", 
            new_content
        )
        new_content = re.sub(
            r'background:\s*"rgba\(255,255,255,0\.0[3456]\)"', 
            r'background:"var(--glass-bg)"', 
            new_content
        )

        new_content = re.sub(r"border:\s*'1px solid rgba\(255,255,255,0\.0[678]\)'", r"border:'1px solid var(--glass-border)'", new_content)
        new_content = re.sub(r'border:\s*"1px solid rgba\(255,255,255,0\.0[678]\)"', r'border:"1px solid var(--glass-border)"', new_content)
        
        new_content = re.sub(r"border:\s*'1px solid rgba\(255,255,255,0\.1\)'", r"border:'1px solid var(--glass-border-strong)'", new_content)
        new_content = re.sub(r"border:\s*'1px solid rgba\(255,255,255,0\.15\)'", r"border:'1px solid var(--glass-border-strong)'", new_content)

        new_content = re.sub(r"background:\s*'rgba\(9,19,42,0\.95\)'", r"background:'var(--glass-nav-bg)'", new_content)
        new_content = re.sub(r"background:\s*'rgba\(6,13,31,0\.[78][58]?\)'", r"background:'var(--glass-nav-bg)'", new_content)

        # For cases where people used Tailwind classes that we want to alias
        # We instead handle text colors by adding a custom Tailwind alias
        new_content = new_content.replace('text-white', 'text-theme-text')
        # Wait, if we just blindly change text-white... some of them should stay white if they are in gradients.
        
        if new_content != content:
            with open(filepath, 'w') as f:
                f.write(new_content)
                
refactor()
print("Done")
