import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  ClipboardCheck,
  Users,
  CheckCircle,
  Clock,
  Zap,
  Shield,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 shadow-sm">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Raporla
            </h1>
            <div className="space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
              >
                Kayıt Ol
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                İş Yönetimi Çözümü
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                İş Süreçlerinizi{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Kolaylaştırın
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Raporla ile iş takibi, raporlama ve ekip yönetimi artık çok daha
                kolay. Tek platform üzerinden tüm süreçlerinizi yönetin.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center gap-2 font-medium"
                >
                  Hemen Başla <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
                >
                  Giriş Yap
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full border-2 border-white bg-gradient-to-r from-blue-${
                        i * 100
                      } to-indigo-${i * 100}`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">1000+</span> mutlu kullanıcı
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -z-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-70 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="bg-white p-4 rounded-2xl shadow-xl">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-gray-500 text-sm">
                        Raporla Dashboard Görünümü
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "98%", label: "Müşteri Memnuniyeti" },
              { value: "24/7", label: "Destek" },
              { value: "100+", label: "Özellik" },
              { value: "10k+", label: "Tamamlanan Görev" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              Özellikler
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tüm İhtiyaçlarınız İçin Tek Platform
            </h2>
            <p className="text-gray-600">
              Raporla, iş süreçlerinizi yönetmek için ihtiyacınız olan tüm
              araçları tek bir platformda birleştirir.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<ClipboardCheck className="w-6 h-6" />}
              title="İş Takibi"
              description="Projelerinizi ve görevlerinizi kolayca takip edin"
            />
            <FeatureCard
              icon={<Calendar className="w-6 h-6" />}
              title="Takvim Yönetimi"
              description="Toplantıları ve önemli tarihleri planlayın"
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Raporlama"
              description="Detaylı raporlar ve analizlerle performansı ölçün"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Ekip Yönetimi"
              description="Ekibinizle etkili iletişim ve iş birliği sağlayın"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              Avantajlar
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Neden Raporla?
            </h2>
            <p className="text-gray-600">
              Raporla ile iş süreçlerinizi daha verimli hale getirin ve rekabet
              avantajı kazanın.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <CheckCircle className="w-5 h-5" />,
                title: "Kolay Kullanım",
                description: "Kullanıcı dostu arayüz ile hızlıca adapte olun",
              },
              {
                icon: <Clock className="w-5 h-5" />,
                title: "Zaman Tasarrufu",
                description:
                  "Otomatik raporlama ile zamanınızı verimli kullanın",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: "Verimlilik Artışı",
                description:
                  "İş süreçlerinizi optimize ederek verimliliği artırın",
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: "Güvenli Altyapı",
                description:
                  "Verileriniz güvenli bir şekilde saklanır ve korunur",
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="flex gap-4 p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Hemen Başlayın</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            İş süreçlerinizi dijitalleştirin ve verimliliğinizi artırın. Raporla
            ile hemen başlayın.
          </p>
          <Link
            href="/register"
            className="px-8 py-3.5 bg-white text-blue-600 rounded-lg hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2 font-medium"
          >
            Ücretsiz Deneyin <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Raporla</h3>
              <p className="mb-6 text-gray-400">
                İş süreçlerinizi dijitalleştirin ve verimliliğinizi artırın.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Ürün</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Özellikler
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Fiyatlandırma
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Entegrasyonlar
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Şirket</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Hakkımızda
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Kariyer
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Destek</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Yardım Merkezi
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    İletişim
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Gizlilik Politikası
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Raporla. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 h-full">
      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
