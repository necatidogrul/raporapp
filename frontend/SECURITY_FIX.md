# Güvenlik Düzeltmesi: Firebase API Anahtarı

## Yapılan Değişiklikler

1. Firebase yapılandırma bilgileri artık direkt kod içerisinde tutulmak yerine ortam değişkenlerinde saklanmaktadır.
2. Ortam değişkenleri `.env.local` dosyasında tutulmaktadır ve bu dosya `.gitignore` ile versiyon kontrolüne dahil edilmemektedir.

## Acil Yapılması Gerekenler

1. **API Anahtarını Yenileyin**: GitHub'da açık bir şekilde paylaşılan API anahtarı güvenlik riski oluşturmaktadır. Google Firebase konsolundan mevcut anahtarı iptal edip yeni bir anahtar oluşturmanız gerekiyor:

   - [Firebase Console](https://console.firebase.google.com/)'a gidin
   - Projenizi seçin
   - "Project Settings" > "Service accounts" bölümüne gidin
   - API anahtarınızı döndürün (rotate)
   - Yeni anahtarı `.env.local` dosyanızda güncelleyin

2. **Geçmiş Commitleri Temizleyin (İsteğe Bağlı)**: API anahtarının geçmiş commit geçmişinden tamamen kaldırılması için git geçmişini temizlemeniz gerekebilir. Bunun için bir uzman ile çalışmanız önerilir.

## Nasıl Çalışır?

`.env.local` dosyasındaki değişkenler Next.js tarafından otomatik olarak yüklenir. Bu değişkenlere erişmek için:

- Tarayıcı tarafında çalışacak kodlar için `NEXT_PUBLIC_` ön ekini kullanın.
- Sunucu tarafında çalışacak kodlar için normal ortam değişkenlerini kullanın.

## Güvenlik İçin Öneriler

1. **Ortam Değişkenlerini Kullanın**: Gizli anahtarları ve hassas bilgileri her zaman ortam değişkenlerinde saklayın.
2. **Pre-commit Hook Kullanın**: Hassas bilgilerin yanlışlıkla commit'lenmesini önlemek için pre-commit hook'ları kullanabilirsiniz.
3. **GitHub Secret Scanning'i Etkinleştirin**: GitHub'ın gizli tarama özelliğini etkinleştirerek bu tür sorunları erken tespit edebilirsiniz.
4. **Ortam Değişkeni Şablonu Paylaşın**: Takım arkadaşlarınız için, gerçek değerler olmadan bir `.env.example` dosyası paylaşın.

Tüm hassas bilgilerin kod içerisinde değil, ortam değişkenlerinde saklanmasına özen gösterin.
