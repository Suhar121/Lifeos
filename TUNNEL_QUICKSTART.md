# Quick Start Guide: Cloudflare Tunnel for LifeOS

## 🚀 5-Minute Setup

### 1. Install cloudflared
```bash
./cloudflare-setup.sh
```

### 2. Authenticate
```bash
cloudflared tunnel login
```
*Browser will open - log in to Cloudflare and select your domain*

### 3. Create Tunnel
```bash
cloudflared tunnel create lifeos
```
**⚠️ SAVE THE TUNNEL ID!** (looks like: `12345678-1234-1234-1234-123456789abc`)

### 4. Update Config
Edit `cloudflare-tunnel-config.yml` and replace **both** instances of `YOUR_TUNNEL_ID_HERE` with your actual tunnel ID.

### 5. Configure DNS
```bash
cloudflared tunnel route dns lifeos lifebuddy.dpdns.org
```

### 6. Start Everything

**Terminal 1 - Backend:**
```bash
cd /home/suhar/Lifeos/.gemini/antigravity/scratch/LifeOS
source app/vevn/bin/activate  # or: source venv/bin/activate
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd /home/suhar/Lifeos/.gemini/antigravity/scratch/LifeOS/frontend
npm run dev
```

**Terminal 3 - Tunnel:**
```bash
cd /home/suhar/Lifeos/.gemini/antigravity/scratch/LifeOS
./start-tunnel.sh
```

### 7. Access Your App
🌐 Open: **https://lifebuddy.dpdns.org**

## ✅ Verification Checklist

- [ ] cloudflared installed
- [ ] Authenticated with Cloudflare  
- [ ] Tunnel created and ID saved
- [ ] Config file updated with tunnel ID
- [ ] DNS configured
- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Tunnel running and connected
- [ ] Website accessible at https://lifebuddy.dpdns.org

## 🔧 Troubleshooting

**"502 Bad Gateway"**
- Check backend is running: `curl http://localhost:8000/docs`
- Check frontend is running: `curl http://localhost:5173`

**"Tunnel won't start"**
- Verify tunnel ID in config file matches your actual tunnel ID
- Check credentials file exists: `ls ~/.cloudflared/*.json`

**"DNS not resolving"**
- Wait 2-5 minutes for DNS propagation
- Verify CNAME in Cloudflare dashboard
- Try: `nslookup lifebuddy.dpdns.org`

## 📚 Full Documentation
See [CLOUDFLARE_TUNNEL_GUIDE.md](./CLOUDFLARE_TUNNEL_GUIDE.md) for detailed instructions.

## 🎯 Production Tips

1. **Run tunnel as service** (auto-start on boot):
   ```bash
   sudo cloudflared service install
   ```

2. **Update frontend API URL** for production:
   ```bash
   cd frontend
   echo "VITE_API_URL=https://lifebuddy.dpdns.org/api" > .env
   npm run build
   ```

3. **Update backend CORS** to allow your domain:
   Edit `app/main.py` and add your domain to allowed origins.

---
**Need Help?** Check the full guide or Cloudflare docs: https://developers.cloudflare.com/cloudflare-one/
