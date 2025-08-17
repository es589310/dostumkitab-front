#!/bin/bash

# Heroku Frontend Deployment Script
# Kitab Satış Saytı

echo "🚀 Heroku Frontend Deployment başlayır..."

# 1. Heroku app yaratmaq (əgər yoxdursa)
echo "📱 Heroku app yaradılır..."
heroku create dostumkitabapp-frontend-eu --region eu

# 2. Git remote əlavə etmək
echo "🔗 Git remote əlavə edilir..."
heroku git:remote -a dostumkitabapp-frontend-eu

# 3. Environment variables təyin etmək
echo "⚙️ Environment variables təyin edilir..."
heroku config:set NODE_ENV=production
heroku config:set NEXT_PUBLIC_API_URL=https://dostumkitabapp-backend-eu-47b73694c0c1.herokuapp.com/api
heroku config:set NEXT_PUBLIC_SITE_URL=https://dostumkitabapp-frontend-eu.herokuapp.com
heroku config:set NEXT_PUBLIC_APP_ENV=production
heroku config:set NEXT_TELEMETRY_DISABLED=1

# 4. Build və deploy
echo "🔨 Build və deploy edilir..."
git add .
git commit -m "Heroku deployment configuration"
git push heroku main

# 5. App açmaq
echo "🌐 App açılır..."
heroku open

echo "✅ Deployment tamamlandı!"
echo "🔗 Frontend URL: https://dostumkitabapp-frontend-eu.herokuapp.com"
echo "🔗 Backend API: https://dostumkitabapp-backend-eu-47b73694c0c1.herokuapp.com/api" 