#!/usr/bin/env python3
"""
Simple HTTP server for serving a SPA (Single Page Application)
Serves index.html for all routes that don't match actual files
"""

import http.server
import socketserver
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

PORT = int(os.getenv('FRONTEND_PORT', '5173'))

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    """Handler that serves index.html for SPA routes"""
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
    
    def do_GET(self):
        # Get the requested path
        path = self.translate_path(self.path)
        
        # If it's a file that exists, serve it
        if os.path.isfile(path):
            return super().do_GET()
        
        # If it's a directory and has index.html, serve that
        if os.path.isdir(path):
            index_path = os.path.join(path, 'index.html')
            if os.path.exists(index_path):
                self.path = '/index.html'
                return super().do_GET()
        
        # For all other routes (SPA routes), serve index.html
        self.path = '/index.html'
        return super().do_GET()

# Change to the dist directory
os.chdir(os.path.join(os.path.dirname(__file__), 'frontend', 'dist'))

print(f"🚀 Serving LifeOS Frontend on http://0.0.0.0:{PORT}")
print(f"📁 Serving from: {os.getcwd()}")
print("Press Ctrl+C to stop\n")

socketserver.TCPServer.allow_reuse_address = True

with socketserver.TCPServer(("0.0.0.0", PORT), SPAHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped")
