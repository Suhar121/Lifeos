import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # We will safely substitute class names
    # text-white to text-theme-text unless it's in a button with clay-btn or something?
    # Actually, a better approach: Let's do selective regex:
    
    # We replace inline rgba styles first:
    content = re.sub(r"rgba\(255,255,255,0\.0[3456]\)", "var(--glass-bg)", content)
    content = re.sub(r"rgba\(255,255,255,0\.0[78]\)", "var(--glass-border)", content)
    content = re.sub(r"rgba\(255,255,255,0\.1\)", "var(--glass-border-strong)", content)
    content = re.sub(r"rgba\(9,19,42,0\.95\)", "var(--glass-nav-bg)", content)

    # For text colors, let's keep text-white where it's meant to be pure white (like buttons with gradients)
    # A simple heuristic: if the line has "clay-btn" or "btn", we might want white. But it's easier
    # to just map them manually or let the user see.
    # What if we just use tailwind "dark:text-white text-slate-800"?
    # If we add dark mode properly, we can replace className="... text-white ..."
    # with className="... text-slate-800 dark:text-white ..."
    pass
