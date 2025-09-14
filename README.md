# 📚 DostumKitab.az - Kitab Satış Platforması

**DostumKitab.az** - Azərbaycan dilində kitab satışı üçün müasir və istifadəçi dostu veb platforması.

## 🌟 Xüsusiyyətlər

### 🛒 E-Ticarət Funksionallığı
- **Kitab Kataloqu**: Geniş kitab kolleksiyası və kateqoriyalar
- **Axtarış və Filtrləmə**: Daha yaxşı axtarış alqoritmləri
- **Səbət Sistemi**: Real-vaxt səbət idarəetməsi
- **Sifariş Prosesi**: Təhlükəsiz ödəniş və sifariş izləmə
- **İstifadəçi Profilləri**: Şəxsi hesablar və sifariş tarixçəsi

### 📱 Texnologiya Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Django REST Framework, Python
- **Styling**: Tailwind CSS, Radix UI komponentləri
- **Database**: PostgreSQL
- **Deployment**: Heroku (EU region)
- **Media**: ImageKit CDN

### 🎨 İstifadəçi Təcrübəsi
- **Responsive Design**: Mobil və desktop uyğunluğu
- **Dark/Light Mode**: Tema dəyişdirici
- **Çoxdilli Dəstək**: Azərbaycan dili (az locale)
- **Modern UI/UX**: Material Design prinsipləri

## 🚀 Quraşdırma və İşə Salma

### Tələblər
- Node.js 18+ 
- Python 3.8+
- PostgreSQL
- Git

### Frontend (Next.js) Quraşdırılması
```bash
# Repository-ni klonlayın
git clone https://github.com/yourusername/dostumkitab.git
cd dostumkitab/kitab-satish-sayt

# Dependencies quraşdırın
npm install

# Development server-i işə salın
npm run dev
```

### Backend (Django) Quraşdırılması
```bash
cd ../django-bookstore

# Virtual environment yaradın
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Dependencies quraşdırın
pip install -r requirements.txt

# Database migration-ları
python manage.py migrate

# Development server-i işə salın
python manage.py runserver
```

## 🌐 Deployment

### Heroku Deployment
Platform Heroku-da deploy edilmişdir:

- **Frontend**: https://dostumkitabapp-000000000
- **Backend API**: https://dostumkitabapp-000000000
- **Domain**: dostumkitab.az

Detallı deployment təlimatları üçün `HEROKU_DEPLOYMENT.md` faylına baxın.

## 📁 Layihə Strukturu

```
faziletkitab/
├── kitab-satish-sayt/          # Next.js Frontend
│   ├── app/                    # App Router struktur
│   ├── components/             # React komponentləri
│   ├── lib/                    # Utility funksiyaları
│   └── styles/                 # CSS faylları
└── django-bookstore/           # Django Backend
    ├── books/                  # Kitab modelləri və API
    ├── orders/                 # Sifariş sistemi
    ├── users/                  # İstifadəçi idarəetməsi
    ├── contact/                # Əlaqə və sosial media
    └── settings/               # Site konfiqurasiyası
```

## 🔧 Konfiqurasiya

### Environment Variables
```bash
# Frontend
NEXT_PUBLIC_API_URL=https://my-backend-url/api
NEXT_PUBLIC_SITE_URL=https://my-frontend-url
NEXT_PUBLIC_APP_ENV=production

# Backend
DATABASE_URL=postgresql://...
SECRET_KEY=my-secret-key
DEBUG=False
```

## 📚 API Sənədləri

Backend API endpoint-ləri:
- `/api/books/` - Kitab siyahısı və detalları
- `/api/categories/` - Kateqoriya siyahısı
- `/api/orders/` - Sifariş idarəetməsi
- `/api/users/` - İstifadəçi əməliyyatları

## 🤝 Töhfə Vermə

1. Repository-ni fork edin
2. Feature branch yaradın (`git checkout -b feature/AmazingFeature`)
3. Dəyişikliklərinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch-inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request yaradın

## 📄 Lisenziya

Bu layihə MIT lisenziyası altında paylaşılır. Detallar üçün `LICENSE` faylına baxın.

## 📞 Əlaqə

- **Website**: https://dostumkitab.az
- **Email**: info@dostumkitab.az
- **GitHub**: https://github.com/es589310

## 🙏 Təşəkkürlər

Bu layihəni mümkün edən bütün açıq mənbə texnologiyalarına və developer cəmiyyətinə təşəkkürlər.

---

**DostumKitab.az** - Azərbaycanın kitabsevərləri üçün birinci seçim! 📖✨
