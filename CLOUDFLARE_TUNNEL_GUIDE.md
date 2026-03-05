# Cloudflare Tunnel Setup Guide for LifeOS

This guide will help you expose your LifeOS application to the internet using Cloudflare Tunnel and your domain `lifebuddy.dpdns.org`.

## What is Cloudflare Tunnel?

Cloudflare Tunnel creates a secure, outbound-only connection from your local machine to Cloudflare's network. No need to open firewall ports or expose your IP address!

## Prerequisites

- A Cloudflare account (free tier works!)
- Your domain `lifebuddy.dpdns.org` must be added to Cloudflare
- Both backend and frontend running locally

## Step-by-Step Setup

### Step 1: Install cloudflared

Run the setup script:
```bash
chmod +x cloudflare-setup.sh
./cloudflare-setup.sh
```

Or install manually:

**Linux:**
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

**macOS:**
```bash
brew install cloudflared
```

**Windows:**
Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

### Step 2: Authenticate with Cloudflare

```bash
cloudflared tunnel login
```

This will open a browser window. Log in to your Cloudflare account and select your domain.

### Step 3: Create a Tunnel

```bash
cloudflared tunnel create lifeos
```

**Important:** Save the Tunnel ID that's displayed! You'll need it in the next step.

Example output:
```
Created tunnel lifeos with id 12345678-1234-1234-1234-123456789abc
```

### Step 4: Update Configuration File

Edit `cloudflare-tunnel-config.yml` and replace `YOUR_TUNNEL_ID_HERE` with your actual tunnel ID (appears twice in the file).

```bash
# Before:
tunnel: YOUR_TUNNEL_ID_HERE
credentials-file: /home/suhar/.cloudflared/YOUR_TUNNEL_ID_HERE.json

# After:
tunnel: 12345678-1234-1234-1234-123456789abc
credentials-file: /home/suhar/.cloudflared/12345678-1234-1234-1234-123456789abc.json
```

### Step 5: Configure DNS

**Option A: Using Command Line (Recommended)**
```bash
cloudflared tunnel route dns lifeos lifebuddy.dpdns.org
```

**Option B: Using Cloudflare Dashboard**
1. Go to https://dash.cloudflare.com
2. Select your domain
3. Go to DNS → Records
4. Add a CNAME record:
   - **Type:** CNAME
   - **Name:** `@` (for root domain) or `lifebuddy` (for subdomain)
   - **Target:** `12345678-1234-1234-1234-123456789abc.cfargotunnel.com`
   - **Proxy status:** Proxied (orange cloud icon)

### Step 6: Start Your Applications

Make sure both services are running:

**Terminal 1 - Backend:**
```bash
# From project root
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 7: Start the Tunnel

**Terminal 3 - Tunnel:**
```bash
chmod +x start-tunnel.sh
./start-tunnel.sh
```

Or manually:
```bash
cloudflared tunnel --config cloudflare-tunnel-config.yml run lifeos
```

## Verify It's Working

1. Open your browser and go to: `https://lifebuddy.dpdns.org`
2. You should see your LifeOS application!
3. API requests to `https://lifebuddy.dpdns.org/api/*` will be routed to your backend
4. All other requests go to your frontend

## Running as a Service (Optional)

To run the tunnel in the background and auto-start on boot:

```bash
sudo cloudflared service install
```

Then edit the service configuration:
```bash
sudo nano /etc/systemd/system/cloudflared.service
```

Add the config file location to the ExecStart line:
```
ExecStart=/usr/bin/cloudflared --config /home/suhar/Lifeos/.gemini/antigravity/scratch/LifeOS/cloudflare-tunnel-config.yml tunnel run lifeos
```

Start the service:
```bash
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

## Troubleshooting

### Tunnel not connecting
- Check that cloudflared is authenticated: `cloudflared tunnel list`
- Verify your tunnel ID in the config file
- Check credentials file exists: `ls ~/.cloudflared/`

### 502 Bad Gateway
- Ensure backend is running on port 8000
- Ensure frontend is running on port 5173
- Check tunnel logs for errors

### DNS not resolving
- Wait a few minutes for DNS propagation
- Clear your DNS cache: `sudo systemd-resolve --flush-caches` (Linux)
- Verify CNAME record in Cloudflare dashboard

### API requests failing
- Check that your frontend's API base URL is set correctly
- Verify the ingress rules in `cloudflare-tunnel-config.yml`

## Useful Commands

```bash
# List all tunnels
cloudflared tunnel list

# Check tunnel status
cloudflared tunnel info lifeos

# View tunnel logs
cloudflared tunnel --config cloudflare-tunnel-config.yml run lifeos

# Delete a tunnel (if you need to start over)
cloudflared tunnel delete lifeos

# Test configuration
cloudflared tunnel --config cloudflare-tunnel-config.yml ingress validate
```

## Security Notes

- ✅ No ports need to be opened on your firewall
- ✅ Your public IP address remains hidden
- ✅ All traffic is encrypted (HTTPS)
- ✅ Cloudflare provides DDoS protection
- ⚠️  Your tunnel credentials file contains sensitive data - keep it secure!

## Production Deployment

For production, consider:
1. Running cloudflared as a system service
2. Using Docker to containerize your apps
3. Setting up proper environment variables
4. Configuring CORS properly for your domain
5. Adding rate limiting and security headers in Cloudflare

## Additional Resources

- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Configure ingress rules](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/local/local-management/ingress/)
- [Best practices](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/best-practices/)

---

**Happy tunneling! 🚀**
