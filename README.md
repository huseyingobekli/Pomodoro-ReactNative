# 🍅 POMODORO ZAMANLAYICI UYGULAMASI - PROJE DOKÜMANTASYONU

## 📋 İçindekiler

1. [Proje Genel Bakış](#proje-genel-bakış)
2. [Teknoloji Stack](#teknoloji-stack)
3. [Proje Yapısı](#proje-yapısı)
4. [Modüller ve Bileşenler](#modüller-ve-bileşenler)
5. [Ekranlar](#ekranlar)
6. [İş Akış Şeması](#iş-akış-şeması)
7. [Sistem Mimarisi](#sistem-mimarisi)
8. [Veri Yönetimi](#veri-yönetimi)
9. [Özellikler](#özellikler)
10. [Konfigürasyon](#konfigürasyon)

---

## 🎯 Proje Genel Bakış

**Pomodoro Zamanlayıcı**, kullanıcıların üretkenliğini artırmak için tasarlanmış modern bir React Native/Expo uygulamasıdır. Pomodoro tekniğini kullanarak çalışma seanslarını takip eder, dikkat dağınıklıklarını kaydeder ve istatistiksel analizler sunar.

### Ana Özellikler:

- ⏱️ Özelleştirilebilir zamanlayıcı (varsayılan 25 dakika)
- 📊 Detaylı istatistikler ve grafikler
- 🎨 Koyu/Açık/Otomatik tema desteği
- 📱 Offline çalışma modu
- ☁️ Firebase ile bulut senkronizasyonu
- 🔄 Otomatik yatay/dikey ekran yönlendirmesi
- 📂 Özelleştirilebilir kategoriler

---

## 🛠️ Teknoloji Stack

### Framework ve Runtime

- **React**: 19.1.0
- **React Native**: 0.81.5
- **Expo SDK**: 54.0.29
- **TypeScript**: 5.9.2
- **Node.js**: Compatible

### Navigasyon

- **expo-router**: 6.0.19
- **@react-navigation/native**: 7.1.8
- **@react-navigation/bottom-tabs**: 7.4.0
- **@react-navigation/elements**: 2.6.3

### Backend ve Veri Yönetimi

- **Firebase**: 12.6.0 (Firestore)
- **AsyncStorage**: 1.24.0
- **Firestore**: Cloud database

### UI Kütüphaneleri

- **@expo/vector-icons**: 15.0.3 (MaterialIcons)
- **expo-symbols**: 1.0.8 (SF Symbols - iOS)
- **react-native-chart-kit**: 6.12.0 (Grafikler)
- **expo-haptics**: 15.0.8 (Dokunsal geri bildirim)

### Diğer Önemli Bağımlılıklar

- **expo-screen-orientation**: 9.0.8
- **expo-splash-screen**: 31.0.12
- **react-native-gesture-handler**: 2.28.0
- **react-native-reanimated**: 4.1.1
- **react-native-safe-area-context**: 5.6.0

---

## 📁 Proje Yapısı

```
pomodoro/
├── app/                          # Ana uygulama dizini (Expo Router)
│   ├── _layout.tsx              # Root layout ve tema sağlayıcı
│   └── (tabs)/                  # Tab navigasyonu grubu
│       ├── _layout.tsx          # Tab bar konfigürasyonu
│       ├── index.tsx            # Ana sayfa (Zamanlayıcı)
│       ├── dashboard.tsx        # İstatistikler sayfası
│       └── settings.tsx         # Ayarlar sayfası
│
├── components/                   # Yeniden kullanılabilir bileşenler
│   ├── ui/                      # UI bileşenleri
│   │   ├── icon-symbol.tsx      # Platform-agnostik icon wrapper
│   │   ├── icon-symbol.ios.tsx # iOS SF Symbols implementasyonu
│   │   └── collapsible.tsx      # Katlanabilir bölüm komponenti
│   ├── themed-text.tsx          # Tema-aware text komponenti
│   ├── themed-view.tsx          # Tema-aware view komponenti
│   ├── haptic-tab.tsx           # Dokunsal geri bildirim ile tab
│   ├── parallax-scroll-view.tsx # Parallax kaydırma efekti
│   └── external-link.tsx        # Harici link komponenti
│
├── config/                       # Konfigürasyon dosyaları
│   └── firebase.ts              # Firebase başlatma ve export
│
├── constants/                    # Sabit değerler
│   └── theme.ts                 # Renk paleti ve font tanımları
│
├── contexts/                     # React Context'leri
│   └── ThemeContext.tsx         # Global tema yönetimi
│
├── hooks/                        # Custom React Hooks
│   ├── use-color-scheme.ts      # Native color scheme hook
│   ├── use-color-scheme.web.ts  # Web için color scheme hook
│   └── use-theme-color.ts       # Tema rengini hesaplama hook
│
├── assets/                       # Statik dosyalar
│   └── images/                  # İkonlar, splash screen, favicon
│
├── scripts/                      # Yardımcı scriptler
│   └── reset-project.js         # Proje sıfırlama scripti
│
├── .expo/                        # Expo build ve cache dosyaları
├── .vscode/                      # VS Code ayarları
├── app.json                      # Expo konfigürasyonu
├── package.json                  # Bağımlılıklar ve scriptler
├── tsconfig.json                 # TypeScript konfigürasyonu
└── eslint.config.js              # ESLint kuralları
```

---

## 🧩 Modüller ve Bileşenler

### 1. **Ana Ekran Modülü (app/(tabs)/index.tsx)**

**Sorumluluklar:**

- Pomodoro zamanlayıcı mantığı
- Durum yönetimi (idle, running, paused)
- Süre ayarlama (+1, -1, +5, -5, özel)
- Kategori seçimi ve yönetimi
- Dikkat dağınıklığı takibi
- Ekran yönlendirme kontrolü
- Tab bar görünürlük yönetimi
- Seans özeti modalı

**State Yönetimi:**

```typescript
- duration: number (dakika)
- timeLeft: number (saniye)
- status: 'idle' | 'running' | 'paused'
- category: string
- distractionCount: number
- showSummary: boolean
- categories: string[]
```

**Ana Fonksiyonlar:**

- `handleStart()`: Zamanlayıcıyı başlatır
- `handlePause()`: Zamanlayıcıyı duraklatır
- `handleReset()`: Zamanlayıcıyı sıfırlar
- `handleShowSummary()`: Seans özetini gösterir
- `saveSessionToFirebase()`: Seansı Firebase'e kaydeder
- `adjustDuration(amount)`: Süreyi ayarlar

**Özellikler:**

- ✅ AppState ile arka plan geçişlerini izler
- ✅ Arka plana geçişte otomatik duraklatma
- ✅ Dikkat dağınıklığı sayacı artırma
- ✅ Landscape mode otomatik geçiş
- ✅ Tab bar gizleme/gösterme
- ✅ Özel süre ve kategori girişi

---

### 2. **İstatistikler Modülü (app/(tabs)/dashboard.tsx)**

**Sorumluluklar:**

- Firebase'ten veri çekme
- Local AsyncStorage'dan veri okuma
- Veri senkronizasyonu
- Grafik verileri hazırlama
- İstatistik hesaplamaları

**State Yönetimi:**

```typescript
- sessions: SessionData[]
- loading: boolean
- refreshing: boolean
```

**SessionData Yapısı:**

```typescript
interface SessionData {
  id: string;
  category: string;
  durationMinutes: number;
  durationSeconds: number;
  distractionCount: number;
  timestamp: any;
  date: string;
}
```

**Gösterilen İstatistikler:**

1. **Bugünün Toplam Süresi**: Bugün tamamlanan seansların toplamı
2. **Tüm Zamanların Toplam Süresi**: Tüm seansların toplamı
3. **Toplam Dikkat Dağınıklığı**: Tüm ihlal sayısı

**Grafikler:**

1. **Bar Chart**: Son 7 günün günlük odaklanma süresi
2. **Pie Chart**: Kategorilere göre zaman dağılımı (%)

**Veri Kaynakları:**

- Firebase Firestore (synced veriler)
- AsyncStorage (local ve unsynced veriler)

---

### 3. **Ayarlar Modülü (app/(tabs)/settings.tsx)**

**Sorumluluklar:**

- Tema seçimi (Light/Dark/Auto)
- Offline mod kontrolü
- Firebase bağlantı testi
- Local veri görüntüleme
- Local veri silme
- Veri senkronizasyonu

**Ana Fonksiyonlar:**

- `toggleOfflineMode()`: Offline/Online geçişi
- `syncLocalDataToFirebase()`: Manuel senkronizasyon
- `viewLocalData()`: Local verileri gösterir
- `clearLocalData()`: Local verileri siler
- `testFirebaseConnection()`: Firebase bağlantısını test eder

**Tema Seçenekleri:**

- **Light**: Açık tema
- **Dark**: Koyu tema
- **Auto**: Sistem teması (otomatik)

---

### 4. **Firebase Modülü (config/firebase.ts)**

**Konfigürasyon:**

```typescript
const firebaseConfig = {
  apiKey: "xxxxxxxxxxxx",
  authDomain: "xxxxxxxxx",
  projectId: "xxxxxxxxxxx",
  storageBucket: "xxxxxxxxx.firebasestorage.app",
  messagingSenderId: "xxxxxxxxxx",
  appId: "xxxxxxxxxxxxxxxxxb",
  measurementId: "xxxxxxxxxx",
};
```

**Export Edilen Servisler:**

- `db`: Firestore database instance
- `auth`: Firebase Authentication instance

**Firestore Koleksiyonları:**

1. `sessions`: Pomodoro seansları
   - category: string
   - durationMinutes: number
   - durationSeconds: number
   - distractionCount: number
   - timestamp: Timestamp
   - date: string

---

### 5. **Tema Modülü (contexts/ThemeContext.tsx)**

**Context Yapısı:**

```typescript
interface ThemeContextType {
  theme: "light" | "dark" | "auto";
  activeTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}
```

**Çalışma Mantığı:**

- AsyncStorage'da tema tercihi saklanır
- System color scheme dinlenir
- "auto" modunda sistem teması kullanılır
- Provider tüm uygulamayı sarar

**Kullanım:**

```typescript
const { theme, activeTheme, setTheme } = useTheme();
```

---

### 6. **UI Bileşenleri**

#### IconSymbol (components/ui/icon-symbol.tsx)

- Platform-agnostik icon wrapper
- iOS'ta SF Symbols kullanır
- Android/Web'de MaterialIcons kullanır
- Mapping sistemi ile isim çevirisi

#### ThemedText & ThemedView

- Otomatik tema rengi uygular
- Light/Dark mod için dinamik renkler
- Özelleştirilebilir override renkleri

#### HapticTab

- Tab tıklamalarında haptic feedback
- iOS'ta Light impact
- Platform kontrolü ile güvenli

---

## 📱 Ekranlar

### 1. Ana Ekran (Home/Timer) - index.tsx

**URL**: `/` veya `/(tabs)`

**Görsel Öğeler:**

- Büyük zamanlayıcı göstergesi (100px → 150px landscape)
- Süre ayarlama butonları (-5, -1, +1, +5, özel)
- Kategori seçimi butonları (+ yeni kategori ekleme)
- Kontrol butonları (Başlat, Duraklat, Bitir, Sıfırla)
- Seans bilgisi satırı (kategori + dikkat sayısı)

**Durum Değişimleri:**

| Durum     | Görünen Butonlar                   | Ekran Yönü | Tab Bar |
| --------- | ---------------------------------- | ---------- | ------- |
| `idle`    | Başlat, Süre ayarları, Kategoriler | Portrait   | Görünür |
| `running` | Duraklat, Sıfırla                  | Landscape  | Gizli   |
| `paused`  | Devam, Bitir, Sıfırla              | Landscape  | Gizli   |

**Landscape Mode Özellikleri:**

- Timer font: 150px
- Minimal UI (sadece timer, kontroller ve seans bilgisi)
- Tam ekran odaklanma deneyimi

---

### 2. İstatistikler Ekranı (Dashboard) - dashboard.tsx

**URL**: `/dashboard`

**Bölümler:**

1. **İstatistik Kartları** (3 adet)

   - 📅 Bugün: Bugünkü toplam süre
   - ⏱️ Toplam: Tüm zamanların toplamı
   - ⚠️ Toplam İhlal: Dikkat dağınıklıkları

2. **Bar Chart: Son 7 Günün Odaklanma Süresi**

   - X ekseni: Tarihler (gg/aa formatında)
   - Y ekseni: Dakika
   - Renk: Dark modda mavi, Light modda koyu mavi

3. **Pie Chart: Kategorilere Göre Dağılım**
   - Her kategori farklı renk
   - Yüzdelik dilim gösterimi
   - Legend ile kategori isimleri

**Pull-to-Refresh:**

- Aşağı çekerek verileri yenileme
- Firebase ve AsyncStorage'dan yeniden yükleme
- Senkronizasyon tetikleme

---

### 3. Ayarlar Ekranı (Settings) - settings.tsx

**URL**: `/settings`

**Bölümler:**

1. **Tema Ayarları**

   - Light, Dark, Auto butonları
   - Aktif tema vurgulu
   - İkon gösterimi (güneş, ay, yıldız)

2. **Bağlantı Ayarları**

   - Online/Offline toggle
   - Local verileri görüntüle
   - Local verileri sil
   - İkon gösterimi (wifi, telefon, çöp kutusu)

3. **Geliştirici Araçları** (sadece DEV modda)
   - Firebase bağlantı testi
   - Test verisi gönderme

---

## 🔄 İş Akış Şeması

### Pomodoro Seans Akışı

```
┌─────────────────┐
│   APP BAŞLAT    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  IDLE DURUMU    │◄──────────────────────────┐
│  - Süre seç     │                           │
│  - Kategori seç │                           │
└────────┬────────┘                           │
         │                                    │
         │ [Başlat]                           │
         ▼                                    │
┌─────────────────┐                           │
│ RUNNING DURUMU  │                           │
│  - Landscape    │                           │
│  - Timer çalışıyor                          │
│  - Tab bar gizli│                           │
└────────┬────────┘                           │
         │                                    │
    ┌────┴────┐                               │
    │         │                               │
[Duraklat]  [Süre Bitti]                      │
    │         │                               │
    ▼         ▼                               │
┌─────────────────┐     ┌─────────────────┐   │
│ PAUSED DURUMU   │     │ SEANS TAMAMLANDI│   │
│  - Landscape    │     │  - Özet modal   │   │
│  - Duraklatıldı │     │  - İstatistikler│   │
└────────┬────────┘     └────────┬────────┘   │
         │                       │            │
    ┌────┴────┐            [Kaydet]           │
    │         │                  │            │
[Devam]   [Bitir]               ▼             │
    │         │         ┌────────────────┐    │
    │         └────────►│ FIREBASE KAYIT │    │
    │                   │ & ASYNC STORAGE│    │
    └───────────────────►└────────┬──────┘    │
                                  │           │
                            [Kapat]           │
                                  │           │
                                  └───────────┘
```

### Veri Senkronizasyon Akışı

```
┌──────────────────────┐
│  SEANS TAMAMLANDI    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  AsyncStorage'a      │
│  kaydet (synced:false)│
└──────────┬───────────┘
           │
           ▼
    ┌──────┴──────┐
    │ Offline Mod?│
    └──────┬──────┘
           │
      ┌────┴────┐
      │         │
    [Evet]    [Hayır]
      │         │
      ▼         ▼
┌──────────┐  ┌──────────────┐
│  Sadece  │  │ Firebase'e   │
│  Local   │  │ kaydet       │
│  Kaydet  │  └──────┬───────┘
└──────────┘         │
                     ▼
              ┌──────────────┐
              │ Başarılı mı? │
              └──────┬───────┘
                     │
                ┌────┴────┐
                │         │
              [Evet]    [Hayır]
                │         │
                ▼         ▼
    ┌──────────────┐  ┌──────────────┐
    │ synced:true  │  │ synced:false │
    │ işaretle     │  │ olarak kal   │
    └──────────────┘  └──────────────┘
```

### Tema Değişiklik Akışı

```
┌──────────────────┐
│ Kullanıcı tema   │
│ seçer            │
└────────┬─────────┘
         │
    ┌────┴────┐
    │ Auto?   │
    └────┬────┘
         │
    ┌────┴────┐
    │         │
  [Evet]    [Hayır]
    │         │
    ▼         ▼
┌─────────┐  ┌──────────────┐
│ System  │  │ Seçilen tema │
│ temasını│  │ kullan       │
│ kullan  │  └──────┬───────┘
└────┬────┘         │
     │              │
     └──────┬───────┘
            ▼
┌──────────────────────┐
│ ThemeContext güncelle│
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ AsyncStorage'a kaydet│
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Tüm componentler     │
│ yeniden render       │
└──────────────────────┘
```

---

## 🏗️ Sistem Mimarisi

### Katmanlı Mimari

```
┌────────────────────────────────────────────┐
│          PRESENTATION LAYER                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Index   │  │Dashboard │  │ Settings │ │
│  │  Screen  │  │  Screen  │  │  Screen  │ │
│  └──────────┘  └──────────┘  └──────────┘ │
└────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────┐
│         COMPONENT LAYER                    │
│  ┌───────────┐  ┌──────────┐  ┌─────────┐ │
│  │ IconSymbol│  │ Themed   │  │ Haptic  │ │
│  │           │  │Components│  │  Tab    │ │
│  └───────────┘  └──────────┘  └─────────┘ │
└────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────┐
│          CONTEXT LAYER                     │
│  ┌──────────────────────────────────────┐  │
│  │        ThemeContext                  │  │
│  │  (Global State Management)           │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────┐
│         BUSINESS LOGIC LAYER               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Timer   │  │  Stats   │  │  Sync    │ │
│  │  Logic   │  │  Calc    │  │  Logic   │ │
│  └──────────┘  └──────────┘  └──────────┘ │
└────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────┐
│          DATA ACCESS LAYER                 │
│  ┌──────────────┐    ┌──────────────────┐ │
│  │   Firebase   │    │  AsyncStorage    │ │
│  │  (Firestore) │    │  (Local Cache)   │ │
│  └──────────────┘    └──────────────────┘ │
└────────────────────────────────────────────┘
```

### Navigasyon Mimarisi

```
┌────────────────────────────────────────┐
│         Root Layout (_layout.tsx)      │
│         - ThemeProvider                │
│         - NavigationThemeProvider      │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│      Tab Layout ((tabs)/_layout.tsx)   │
│      - Bottom Tab Navigator            │
│      - Theme-aware styling             │
└────────┬───────┬───────┬───────────────┘
         │       │       │
    ┌────┘       │       └────┐
    │            │            │
    ▼            ▼            ▼
┌────────┐  ┌────────┐  ┌────────┐
│ Index  │  │Dashboard│  │Settings│
│Screen  │  │ Screen │  │ Screen │
└────────┘  └────────┘  └────────┘
```

### State Management Akışı

```
┌─────────────────────────────────────────┐
│         Component State (useState)       │
│  - Timer state (duration, timeLeft)     │
│  - UI state (modals, inputs)            │
│  - Session state (category, distraction)│
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Context State (useContext)       │
│  - Theme preference (light/dark/auto)   │
│  - Active theme (computed)              │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│       Persistent State (AsyncStorage)    │
│  - Theme preference                     │
│  - Categories list                      │
│  - Unsynced sessions                    │
│  - Offline mode flag                    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│       Cloud State (Firebase/Firestore)   │
│  - Synced sessions                      │
│  - User data (future)                   │
└─────────────────────────────────────────┘
```

---

## 💾 Veri Yönetimi

### AsyncStorage Schema

```typescript
// Key: "theme"
type ThemeValue = "light" | "dark" | "auto";

// Key: "offlineMode"
type OfflineModeValue = "true" | "false";

// Key: "categories"
type CategoriesValue = string[]; // JSON string
// Example: '["Ders Çalışma","Kodlama","Proje","Kitap Okuma"]'

// Key: "sessions"
interface LocalSession {
  id: string;
  category: string;
  durationMinutes: number;
  durationSeconds: number;
  distractionCount: number;
  timestamp: string; // ISO string
  date: string; // Date.toDateString()
  synced: boolean;
}
type SessionsValue = LocalSession[]; // JSON string
```

### Firestore Schema

**Collection: `sessions`**

```typescript
{
  category: string;
  durationMinutes: number;
  durationSeconds: number;
  distractionCount: number;
  timestamp: Timestamp;
  date: string; // Date.toDateString()
}
```

**Collection: `test`** (Development only)

```typescript
{
  test: boolean;
  timestamp: Timestamp;
  message: string;
}
```

### Veri Akışı Stratejileri

#### Write Strategy (Seans Kaydetme)

1. **AsyncStorage'a yaz** (synced: false)
2. **Offline mode kontrolü**
   - Offline → Sadece local'de kal
   - Online → Firebase'e gönder
3. **Firebase başarılıysa** → synced: true işaretle

#### Read Strategy (Veri Okuma)

1. **Local unsynced verileri oku**
2. **Firebase'ten tüm verileri oku**
3. **Verileri birleştir** (ID bazında deduplication)
4. **Görüntüle**

#### Sync Strategy (Senkronizasyon)

1. **Dashboard açılışında otomatik**
2. **Ayarlarda manuel tetikleme**
3. **Online moda geçişte otomatik**
4. **Unsynced verileri topla**
5. **Tek tek Firebase'e gönder**
6. **Başarılıysa synced: true işaretle**

---

## ✨ Özellikler

### 1. Zamanlayıcı Özellikleri

- ⏱️ Varsayılan 25 dakika (özelleştirilebilir)
- ➕ Hızlı ayarlama (-5, -1, +1, +5 dakika)
- ✏️ Özel süre girişi (minimum 1 dakika)
- ▶️ Başlat/Duraklat/Sıfırla kontrolleri
- 🔄 Otomatik landscape mode (running/paused)
- 🎯 Tam ekran odaklanma modu

### 2. Kategori Yönetimi

- 📂 Varsayılan kategoriler (Ders Çalışma, Kodlama, Proje, Kitap Okuma)
- ➕ Yeni kategori ekleme
- 🗑️ Kategori silme (uzun basma)
- 💾 AsyncStorage'da kalıcı saklama

### 3. Dikkat Dağınıklığı Takibi

- 📱 AppState ile arka plan geçişlerini izleme
- ⏸️ Arka plana geçişte otomatik duraklatma
- ➕ Otomatik dikkat sayacı artırma
- 📊 Seans özetinde gösterim

### 4. İstatistikler ve Grafikler

- 📊 Bugünün toplam süresi
- 🏆 Tüm zamanların toplamı
- ⚠️ Toplam dikkat dağınıklığı
- 📈 Son 7 günün bar chart'ı
- 🥧 Kategorilere göre pie chart
- 🔄 Pull-to-refresh

### 5. Tema Sistemi

- 🌞 Light mode
- 🌙 Dark mode
- ✨ Auto mode (sistem teması)
- 🎨 Tüm ekranlarda tutarlı renkler
- 💾 Tercih kaydı (AsyncStorage)

### 6. Offline Destek

- 📱 Tamamen offline çalışabilme
- 💾 Local verilerin AsyncStorage'da saklanması
- ☁️ Internet geldiğinde otomatik senkronizasyon
- 🔄 Manuel senkronizasyon seçeneği
- 🚫 Offline mode toggle

### 7. UI/UX Özellikleri

- 🔄 Tab bar otomatik gizleme (timer modunda)
- 📱 Responsive tasarım (portrait/landscape)
- 🎭 Smooth animasyonlar
- 📳 Haptic feedback (iOS)
- 🎨 Material Icons ve SF Symbols
- 🌈 Gradient ve shadow efektleri

---

## ⚙️ Konfigürasyon

### app.json

```json
{
  "expo": {
    "name": "pomodoro",
    "slug": "pomodoro",
    "version": "1.0.0",
    "orientation": "default", // Portrait ve Landscape destekler
    "userInterfaceStyle": "automatic", // Light/Dark tema
    "newArchEnabled": true, // Yeni React Native mimarisi
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png"
      },
      "edgeToEdgeEnabled": true
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "backgroundColor": "#ffffff"
        }
      ]
    ]
  }
}
```

### tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"] // Absolute imports için
    }
  }
}
```

### Firebase Configuration

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyAGzeN9f3UWGfjWjHgwwtzxwtNw9fNSBKA",
  authDomain: "pomodoro-93e38.firebaseapp.com",
  projectId: "pomodoro-93e38",
  storageBucket: "pomodoro-93e38.firebasestorage.app",
  messagingSenderId: "407993649874",
  appId: "1:407993649874:web:088346842eca91ecb67b0b",
};
```

### Tema Renkleri (constants/theme.ts)

```typescript
export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: "#0a7ea4",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: "#0a7ea4",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: "#fff",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#fff",
  },
};
```

---

## 🚀 Çalıştırma ve Geliştirme

### Kurulum

```bash
npm install
```

### Geliştirme Sunucusu

```bash
npx expo start
```

### Platform-Spesifik Çalıştırma

```bash
npm run android  # Android emulator
npm run ios      # iOS simulator
npm run web      # Web browser
```

### Build

```bash
# Development build
eas build --profile development

# Production build
eas build --profile production
```

---

## 📊 Performans Optimizasyonları

### Yapılanlar:

- ✅ `React.useCallback` ile memoization
- ✅ `useFocusEffect` ile sadece aktif ekranda veri yükleme
- ✅ Lazy loading (sayfa bazlı component yükleme)
- ✅ AsyncStorage ile local caching
- ✅ Firebase query optimization (sadece gerekli veriler)
- ✅ Pull-to-refresh ile manuel veri yenileme

### Gelecek İyileştirmeler:

- 🔄 React Query/SWR ile data fetching
- 🔄 Virtualized lists (büyük veri setleri için)
- 🔄 Image optimization ve lazy loading
- 🔄 Service Worker ile offline-first approach

---

## 🔒 Güvenlik

### Mevcut Durum:

- ⚠️ Firebase API keys public (client-side app için normal)
- ⚠️ Firestore rules varsayılan (herkes okuyabilir/yazabilir)
- ✅ HTTPS zorunlu (Firebase default)

### Önerilen İyileştirmeler:

```javascript
// Firestore Security Rules örneği
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      // Sadece authenticated users yazabilir
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🐛 Bilinen Sorunlar ve Sınırlamalar

1. **Tab Bar İkonları**

   - ✅ Çözüldü: Dark/Light mode renk uyumu
   - ✅ Çözüldü: Mobile'da settings ikonu gösterimi

2. **Orientation Lock**

   - ⚠️ Bitir butonu modal ile orientation conflict (çözüldü)
   - ✅ Portrait'e dönüş modal öncesi yapılıyor

3. **Firebase Senkronizasyon**

   - ⚠️ Internet kesilirse unsynced veriler kalıyor
   - ✅ Dashboard açılışında otomatik sync deniyor

4. **Kategori Yönetimi**
   - ⚠️ Kategori silme onayı tek seferlik (geri alma yok)

---

## 📝 Geliştirme Notları

### Kod Standartları:

- TypeScript strict mode aktif
- ESLint (expo config)
- Functional components (hooks)
- React 19+ (Server Components hazır değil)

### Git Ignore:

```
node_modules/
.expo/
dist/
ios/
android/
*.tsbuildinfo
```

### VS Code Ayarları:

- Auto-format on save
- Auto-organize imports
- Expo Tools extension önerili

---

## 👥 Ekip ve Katkıda Bulunanlar

**Geliştirici:** [Hüseyin Göbekli]
**Teknoloji Stack:** Expo + React Native + Firebase
**Platform:** iOS, Android, Web

---

## 📄 Lisans

[Lisans bilgisi eklenecek]

---
