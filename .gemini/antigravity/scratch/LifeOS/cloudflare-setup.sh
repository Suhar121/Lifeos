#!/bin/bash

# Cloudflare Tunnel Setup Script for LifeOS
# Domain: lifebuddy.dpdns.org

set -e

echo "======================================"
echo "  Cloudflare Tunnel Setup for LifeOS"
echo "======================================"
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared is not installed."
    echo ""
    echo "Installing cloudflared..."
    
    # Detect OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux installation
        wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        sudo dpkg -i cloudflared-linux-amd64.deb
        rm cloudflared-linux-amd64.deb
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS installation
        brew install cloudflared
    else
        echo "Please install cloudflared manually from:"
        echo "https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
        exit 1
    fi
    
    echo "✅ cloudflared installed successfully!"
else
    echo "✅ cloudflared is already installed"
fi

echo ""
echo "======================================"
echo "  Manual Setup Steps Required"
echo "======================================"
echo ""
echo "1. Authenticate with Cloudflare:"
echo "   Run: cloudflared tunnel login"
echo "   This will open a browser to log in to your Cloudflare account"
echo ""
echo "2. Create a tunnel:"
echo "   Run: cloudflared tunnel create lifeos"
echo "   Save the Tunnel ID that's displayed!"
echo ""
echo "3. Update cloudflare-tunnel-config.yml:"
echo "   Replace YOUR_TUNNEL_ID_HERE with your actual tunnel ID (twice)"
echo ""
echo "4. Configure DNS in Cloudflare Dashboard:"
echo "   Go to: https://dash.cloudflare.com"
echo "   Navigate to your domain's DNS settings"
echo "   Add a CNAME record:"
echo "     - Name: @ (or lifebuddy if using subdomain)"
echo "     - Target: YOUR_TUNNEL_ID.cfargotunnel.com"
echo "     - Proxy status: Proxied (orange cloud)"
echo ""
echo "   OR use this command (after creating tunnel):"
echo "   cloudflared tunnel route dns lifeos lifebuddy.dpdns.org"
echo ""
echo "5. Start the tunnel:"
echo "   Run: ./start-tunnel.sh"
echo ""
echo "======================================"
echo ""
echo "For more help, visit:"
echo "https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/"
echo ""
