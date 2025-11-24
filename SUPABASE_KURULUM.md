# 🚀 Supabase Kurulum Rehberi

Bu rehber, stok kontrol uygulamanızı Supabase ile senkronize etmek için gerekli adımları içerir.

## 📋 Adım 1: Supabase Projesi Oluşturma

1. **Supabase'e gidin:**
   - https://supabase.com adresine gidin
   - "Start your project" butonuna tıklayın
   - GitHub hesabınızla giriş yapın (ücretsiz)

2. **Yeni proje oluşturun:**
   - "New Project" butonuna tıklayın
   - Organization: Yeni oluşturun veya mevcut olanı seçin
   - Project Name: `stokapp`
   - Database Password: Güçlü bir şifre oluşturun (kaydedin!)
   - Region: Size en yakın bölgeyi seçin (örn: `West Europe`)
   - "Create new project" butonuna tıklayın
   - 2-3 dakika bekleyin (database oluşturuluyor)

## 📋 Adım 2: API Bilgilerini Alma

1. **Project Settings'e gidin:**
   - Sol menüden "Settings" (⚙️) → "API" seçeneğine tıklayın

2. **Bilgileri kopyalayın:**
   - **Project URL**: `https://pxnqxovswnbuovsiekkm.supabase.co` (kopyalayın)
   - **anon public key**: Aşağıdaki adımları takip edin:

### Anon Public Key'i Bulma:

**Yöntem 1: API Settings Sayfasında**
- API Settings sayfasında aşağı kaydırın
- "Project API keys" veya "API Keys" bölümünü bulun
- **anon** veya **anon public** yazan key'i kopyalayın
- Bu key `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` şeklinde uzun bir string olacak

**Yöntem 2: API Keys Sekmesinden**
- Sol menüden "Settings" → "API Keys" seçeneğine tıklayın
- **anon public** key'i bulun ve kopyalayın
- ⚠️ **service_role** key'i kullanmayın, sadece **anon public** key'i kullanın!

**Yöntem 3: Eğer Hala Bulamıyorsanız**
- Sol menüden "Settings" → "General" seçeneğine gidin
- "Reference ID" veya "Project URL" yanında API key olabilir
- Veya "API" sekmesine tekrar dönün ve sayfayı yenileyin

3. **Bilgileri kaydedin:**
   - Project URL: `https://pxnqxovswnbuovsiekkm.supabase.co`
   - anon public key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (kopyaladığınız key)

## 📋 Adım 3: Tabloları Oluşturma

1. **SQL Editor'a gidin:**
   - Sol menüden "SQL Editor" seçeneğine tıklayın
   - "New query" butonuna tıklayın

2. **Tabloları oluşturun:**
   Aşağıdaki SQL'i kopyalayıp SQL Editor'a yapıştırın ve "Run" butonuna tıklayın:

```sql
-- Eksik Ürünler Tablosu
CREATE TABLE eksik_urunler (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  urun_adi TEXT NOT NULL,
  kategori TEXT,
  miktar NUMERIC NOT NULL,
  barkod TEXT,
  resim TEXT,
  aciklama TEXT,
  tarih TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fazla Ürünler Tablosu
CREATE TABLE fazla_urunler (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  urun_adi TEXT NOT NULL,
  kategori TEXT,
  miktar NUMERIC NOT NULL,
  barkod TEXT,
  resim TEXT,
  aciklama TEXT,
  tarih TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler (performans için - arama hızlandırır)
CREATE INDEX idx_eksik_barkod ON eksik_urunler(barkod);
CREATE INDEX idx_fazla_barkod ON fazla_urunler(barkod);
CREATE INDEX idx_eksik_urun_adi ON eksik_urunler(urun_adi);
CREATE INDEX idx_fazla_urun_adi ON fazla_urunler(urun_adi);
```

3. **"Run" butonuna tıklayın**
   - Başarılı mesajını görmelisiniz

## 📋 Adım 4: Row Level Security (RLS) Ayarları

1. **RLS'i etkinleştirin:**
   SQL Editor'da yeni bir query oluşturun ve şunu çalıştırın:

```sql
-- RLS'i etkinleştir
ALTER TABLE eksik_urunler ENABLE ROW LEVEL SECURITY;
ALTER TABLE fazla_urunler ENABLE ROW LEVEL SECURITY;

-- Önce mevcut policy'leri sil (eğer varsa)
DROP POLICY IF EXISTS "Allow all operations on eksik_urunler" ON eksik_urunler;
DROP POLICY IF EXISTS "Allow all operations on fazla_urunler" ON fazla_urunler;

-- Herkese okuma ve yazma izni ver (geliştirme için)
CREATE POLICY "Allow all operations on eksik_urunler"
  ON eksik_urunler
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on fazla_urunler"
  ON fazla_urunler
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

2. **"Run" butonuna tıklayın**

⚠️ **Not:** Eğer "policy already exists" hatası alırsanız, yukarıdaki SQL'de `DROP POLICY IF EXISTS` komutları eklenmiştir, bu hatayı önler.

⚠️ **Güvenlik Notu:** Bu kurallar herkese açık erişim sağlar. Üretim ortamında kullanıcı kimlik doğrulaması eklemeniz önerilir.

## 📋 Adım 5: Supabase Config Dosyasını Güncelleme

1. **Projenizde `src/config/supabase.js` dosyasını açın**

2. **Yapılandırma bilgilerini yapıştırın:**
   ```javascript
   const supabaseUrl = 'https://xxxxx.supabase.co' // Supabase'den aldığınız URL
   const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Supabase'den aldığınız key
   ```

3. **Değerleri değiştirin:**
   - `YOUR_SUPABASE_URL` → Supabase'den aldığınız Project URL
   - `YOUR_SUPABASE_ANON_KEY` → Supabase'den aldığınız anon public key

## 📋 Adım 6: Paketleri Yükleme

Terminal'de proje klasöründe:

```bash
npm install
```

## 📋 Adım 7: Uygulamayı Test Etme

1. **Uygulamayı çalıştırın:**
   ```bash
   npm run dev
   ```

2. **Test edin:**
   - Bir ürün ekleyin
   - Farklı bir tarayıcıda veya cihazda açın
   - Ürünün otomatik olarak göründüğünü kontrol edin
   - Gerçek zamanlı senkronizasyon çalışıyor! ✅

## 📋 Adım 8: Vercel'e Deploy

1. **Değişiklikleri commit edin:**
   ```bash
   git add .
   git commit -m "Supabase entegrasyonu eklendi"
   git push
   ```

2. **Vercel otomatik deploy edecek:**
   - Vercel Supabase config dosyasını okuyacak
   - Uygulama canlıda çalışacak

## 🔒 Güvenlik İyileştirmeleri (İsteğe Bağlı)

Üretim ortamında güvenliği artırmak için:

1. **Supabase Authentication ekleyin**
2. **Güvenlik kurallarını güncelleyin:**
   ```sql
   -- Sadece authenticated kullanıcılar erişebilir
   CREATE POLICY "Authenticated users only"
     ON eksik_urunler
     FOR ALL
     USING (auth.role() = 'authenticated')
     WITH CHECK (auth.role() = 'authenticated');
   ```

## ❓ Sorun Giderme

### Hata: "Invalid API key"
- Supabase Console'dan doğru key'i kopyaladığınızdan emin olun
- `anon public key` kullanın, `service_role key` değil

### Hata: "relation does not exist"
- Tabloları oluşturduğunuzdan emin olun
- SQL Editor'da tabloları kontrol edin

### Veriler görünmüyor
- Supabase Console → Table Editor'da verileri kontrol edin
- Browser console'da hata var mı kontrol edin
- RLS kurallarını kontrol edin

### Gerçek zamanlı çalışmıyor
- Supabase Console → Database → Replication'da tabloların aktif olduğundan emin olun
- Browser console'da hata var mı kontrol edin

## 📚 Kaynaklar

- Supabase Dokümantasyonu: https://supabase.com/docs
- Supabase Console: https://app.supabase.com
- Supabase Discord: https://discord.supabase.com

## ✅ Tamamlandı!

Artık uygulamanız gerçek zamanlı olarak senkronize çalışıyor! 🎉

**Önemli:** Supabase config dosyasındaki bilgileri güncellemeyi unutmayın!

