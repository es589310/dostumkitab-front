# Heroku Frontend Deployment Təlimatları

## 🚀 Deployment Adımları

### 1. Heroku CLI Quraşdırılması
```bash
# Heroku CLI yükləyin
curl https://cli-assets.heroku.com/install.sh | sh

# Login olun
heroku login
```

### 2. Avtomatik Deployment
```bash
# Deployment script-i işə salın
./deploy-heroku.sh
```

### 3. Manual Deployment
```bash
# Heroku app yaradın
heroku create dostumkitabapp-frontend-eu --region eu

# Git remote əlavə edin
heroku git:remote -a dostumkitabapp-frontend-eu

# Environment variables təyin edin
heroku config:set NODE_ENV=production
heroku config:set NEXT_PUBLIC_API_URL=https://dostumkitabapp-backend-eu-47b73694c0c1.herokuapp.com/api
heroku config:set NEXT_PUBLIC_SITE_URL=https://dostumkitabapp-frontend-eu.herokuapp.com
heroku config:set NEXT_PUBLIC_APP_ENV=production
heroku config:set NEXT_TELEMETRY_DISABLED=1

# Deploy edin
git add .
git commit -m "Heroku deployment"
git push heroku main
```

## 🔧 Konfiqurasiya

### Environment Variables
- `NODE_ENV`: production
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_SITE_URL`: Frontend URL
- `NEXT_PUBLIC_APP_ENV`: production

### Backend API
- **URL**: https://dostumkitabapp-backend-eu-47b73694c0c1.herokuapp.com/api
- **Media**: https://dostumkitabapp-backend-eu-47b73694c0c1.herokuapp.com/media/

## 📱 App URL-ləri
- **Frontend**: https://dostumkitabapp-frontend-eu.herokuapp.com
- **Backend**: https://dostumkitabapp-backend-eu-47b73694c0c1.herokuapp.com

## 🚨 Problem Həlli

### Build Xətaları
```bash
# Log-ları yoxlayın
heroku logs --tail

# Build cache təmizləyin
heroku plugins:install heroku-builds
heroku builds:cache:purge -a dostumkitabapp-frontend-eu
```

### Environment Variables
```bash
# Mövcud config-ləri yoxlayın
heroku config

# Config-i yenidən təyin edin
heroku config:set NODE_ENV=production
```

## 📚 Əlavə Məlumat
- **Region**: EU (Avropa)
- **Buildpack**: Node.js
- **Framework**: Next.js 15
- **Database**: Backend-də PostgreSQL 