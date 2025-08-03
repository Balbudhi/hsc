# MIT HSC Website Deployment Guide

## 🎯 **Workflow Overview**

1. **Edit on GitHub** → Easy web-based editing
2. **Auto-deploy to MIT** → Keeps `web.mit.edu/hsc/www/` updated
3. **Keep same URL** → No changes for users

---

## 🚀 **Setup Steps**

### **1. Create GitHub Repository**
```bash
# Initialize and push to GitHub
git add .
git commit -m "Initial HSC website commit"
git remote add origin https://github.com/YOUR_USERNAME/mit-hsc-website.git
git push -u origin main
```

### **2. MIT AFS Setup** 
SSH to MIT and set up the web directory:
```bash
ssh athena.dialup.mit.edu
cd /mit/hsc/www
git clone https://github.com/YOUR_USERNAME/mit-hsc-website.git .
cp -r public/* .
fs sa . system:anyuser rl
```

### **3. GitHub Secrets (for auto-deploy)**
In GitHub repo → Settings → Secrets → Add:
- `MIT_USERNAME`: Your MIT username
- `MIT_PASSWORD`: Your MIT password

---

## 📝 **Daily Editing Workflow**

### **Option A: GitHub Web Interface (Easiest)**
1. Go to GitHub repo
2. Click file → Edit button
3. Make changes
4. Commit → Auto-deploys to MIT

### **Option B: Manual Deploy**
```bash
npm run deploy
# OR manually:
ssh athena.dialup.mit.edu
cd /mit/hsc/www && git pull
```

---

## 🔧 **Content Updates**

### **Text Changes**
- Edit `public/index.html` directly on GitHub
- Changes appear at `web.mit.edu/hsc/www/` in ~2 minutes

### **Images**
- Upload to `public/assets/` folders on GitHub  
- Update HTML references
- Auto-deploy handles the rest

### **Code Changes**
- Edit CSS/JS files on GitHub
- Build process runs automatically
- MIT site updates

---

## 📊 **Benefits**

✅ **Keep MIT URL**: `web.mit.edu/hsc/www/`  
✅ **Easy editing**: GitHub web interface  
✅ **Version control**: Full history  
✅ **Multiple editors**: Team collaboration  
✅ **Automatic backups**: Git history  
✅ **No downtime**: Seamless updates

---

## 🆘 **Troubleshooting**

**If auto-deploy fails:**
```bash
ssh athena.dialup.mit.edu
cd /mit/hsc/www
git pull origin main
cp -r public/* .
```

**Check website:**
- MIT URL: `http://web.mit.edu/hsc/www/`
- GitHub Pages (backup): `https://username.github.io/mit-hsc-website/`

**Common issues:**
- Check AFS permissions: `fs la`
- Verify files copied: `ls -la`
- Check git status: `git status`