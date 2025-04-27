import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  Zap,
  Shield,
  Star,
  Play,
  ArrowUpRight,
  Sparkles,
  Layers,
  GitBranch as Workflow,
  Lightbulb,
  Infinity,
  BrainCircuit as Brain,
  Building2 as Building,
  Headphones as HeadSet,
  Puzzle,
  CheckSquare,
  BarChart as Chart,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-xl z-50 border-b border-gray-100/50">
        <nav className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="relative">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600 animate-pulse" />
                <div className="absolute inset-0 w-full h-full bg-blue-600/20 blur-xl rounded-full"></div>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
                Raporla
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
              <Link
                href="/login"
                className="text-sm sm:text-base text-gray-600 hover:text-gray-900 font-medium whitespace-nowrap hover:scale-105 transition-all duration-300"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="relative inline-flex items-center justify-center h-8 sm:h-9 md:h-11 px-3 sm:px-4 md:px-8 text-sm sm:text-base font-medium text-white bg-black rounded-full overflow-hidden group whitespace-nowrap hover:scale-105 transform transition-transform"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative">Ücretsiz Başla</span>
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ml-1.5 sm:ml-2 relative group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 px-3 sm:px-6 relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(56,189,248,0.1),rgba(168,85,247,0.1))]" />
        <div className="absolute inset-y-0 right-0 w-[200%] rotate-12 bg-gradient-to-l from-blue-50/50 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_800px_at_100%_200px,rgba(56,189,248,0.1),transparent)]" />
        <div className="container mx-auto max-w-7xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full text-xs sm:text-sm font-medium text-blue-700 mb-6 sm:mb-8 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 cursor-pointer group shadow-sm hover:scale-105 transform">
                <Infinity className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                <span>Sınırsız Olasılıklar</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </div>
              <h1 className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 leading-[1.1] tracking-tight">
                İş Süreçlerinizi{" "}
                <span className="relative inline-block">
                  Yeniden Tanımlayın
                  <div className="absolute -bottom-2 left-0 right-0 h-2 sm:h-3 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 -rotate-1 animate-pulse"></div>
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 leading-relaxed max-w-xl">
                Geleneksel iş yönetimini unutun. Raporla ile yapay zeka destekli
                süreç yönetimi, gerçek zamanlı analizler ve akıllı otomasyon
                araçlarıyla tanışın.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/register"
                  className="group relative inline-flex items-center justify-center h-14 gap-2 px-8 font-medium text-white rounded-full overflow-hidden transform hover:scale-105 transition-all duration-300"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x" />
                  <span className="relative">Ücretsiz Hesap Oluştur</span>
                  <ArrowUpRight className="w-5 h-5 relative group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
                <button className="group inline-flex items-center justify-center h-14 gap-3 px-8 font-medium text-gray-900 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 text-lg border-2 border-gray-100 hover:border-gray-200 shadow-lg shadow-gray-100/50 transform hover:scale-105">
                  <Play className="w-5 h-5" />
                  Nasıl Çalışır?
                </button>
              </div>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-[3px] border-white bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs sm:text-sm font-medium shadow-xl ring-2 ring-black/5 animate-pulse hover:scale-110 transform transition-transform cursor-pointer"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-base sm:text-lg">
                      10.000+ Aktif Kullanıcı
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                      <span className="text-xs sm:text-sm text-gray-600 ml-1 sm:ml-2 font-medium">
                        4.9/5 kullanıcı memnuniyeti
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100/50 hover:shadow-3xl hover:scale-[1.02] transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <BarChart3 className="w-6 h-6 text-blue-600 group-hover:text-white relative z-10 transition-colors duration-300" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Gerçek Zamanlı Metrikler
                        </h3>
                        <p className="text-sm text-gray-500">
                          Canlı Performans
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm text-gray-500">Aktif</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      {
                        label: "Proje Tamamlanma",
                        value: "92%",
                        color: "bg-gradient-to-r from-emerald-500 to-teal-500",
                        icon: CheckCircle,
                        trend: "+12%",
                      },
                      {
                        label: "Ekip Verimliliği",
                        value: "96%",
                        color: "bg-gradient-to-r from-blue-500 to-cyan-500",
                        icon: Users,
                        trend: "+8%",
                      },
                      {
                        label: "Müşteri Memnuniyeti",
                        value: "98%",
                        color: "bg-gradient-to-r from-purple-500 to-pink-500",
                        icon: Zap,
                        trend: "+15%",
                      },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="group relative bg-gradient-to-r from-gray-50 to-transparent p-6 rounded-2xl hover:from-gray-100 hover:scale-[1.02] transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg relative overflow-hidden`}
                            >
                              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                              {<stat.icon className="w-6 h-6 relative z-10" />}
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 text-lg block">
                                {stat.label}
                              </span>
                              <span className="text-sm text-green-600 flex items-center gap-1">
                                <ArrowUpRight className="w-4 h-4" />
                                {stat.trend} bu ay
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-2xl font-bold bg-clip-text text-transparent ${stat.color}`}
                          >
                            {stat.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 w-full h-full bg-gradient-to-r from-blue-100/50 via-purple-100/50 to-pink-100/50 blur-3xl -top-10 -right-10 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" />
        <div className="container mx-auto px-6 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                value: "500+",
                label: "Kurumsal Müşteri",
                gradient: "from-blue-600 to-cyan-600",
                icon: Building,
              },
              {
                value: "7/24",
                label: "Canlı Destek",
                gradient: "from-purple-600 to-pink-600",
                icon: HeadSet,
              },
              {
                value: "150+",
                label: "Entegrasyon",
                gradient: "from-pink-600 to-rose-600",
                icon: Puzzle,
              },
              {
                value: "1M+",
                label: "Tamamlanan Görev",
                gradient: "from-emerald-600 to-teal-600",
                icon: CheckSquare,
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden min-h-[120px] flex flex-col justify-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-3 sm:p-4 text-center">
                  <div
                    className={`text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1 sm:mb-2`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2">
                    {<stat.icon className="w-3 h-3 sm:w-4 sm:h-4" />}
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="pt-16 pb-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
        <div className="container mx-auto px-6 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full text-sm font-medium text-blue-700 mb-6 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 cursor-pointer group">
              <Lightbulb className="w-4 h-4" />
              <span>Yenilikçi Özellikler</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Geleceğin İş Yönetim Platformu
            </h2>
            <p className="text-lg text-gray-600">
              Yapay zeka destekli araçlar ve otomatik iş akışlarıyla işinizi
              dönüştürün.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Yapay Zeka Asistanı",
                description:
                  "Akıllı öneriler ve otomatik görev planlamasıyla verimliliğinizi artırın.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: Workflow,
                title: "Akıllı İş Akışları",
                description:
                  "Süreçlerinizi otomatikleştirin, tekrarlayan görevleri minimize edin.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Chart,
                title: "Gelişmiş Analizler",
                description:
                  "Detaylı raporlar ve tahmine dayalı analizlerle doğru kararlar alın.",
                gradient: "from-emerald-500 to-teal-500",
              },
              {
                icon: Layers,
                title: "Entegre Çözümler",
                description:
                  "Mevcut araçlarınızla sorunsuz entegrasyon ve veri senkronizasyonu.",
                gradient: "from-orange-500 to-red-500",
              },
              {
                icon: Shield,
                title: "Kurumsal Güvenlik",
                description:
                  "En üst düzey güvenlik standartları ve veri koruma protokolleri.",
                gradient: "from-yellow-500 to-orange-500",
              },
              {
                icon: Sparkles,
                title: "Özelleştirilebilir Arayüz",
                description:
                  "Ekibinizin ihtiyaçlarına göre tamamen özelleştirilebilir dashboard.",
                gradient: "from-rose-500 to-pink-500",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                  {<feature.icon className="w-7 h-7 relative z-10" />}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-sm font-medium text-blue-700 mb-6 hover:bg-blue-100 transition-colors cursor-pointer group">
              <Sparkles className="w-4 h-4" />
              <span>Avantajlar</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Neden{" "}
              <span className="relative inline-block">
                Raporla
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 -rotate-1"></div>
              </span>
              ?
            </h2>
            <p className="text-xl text-gray-600">
              Raporla ile iş süreçlerinizi daha verimli hale getirin ve rekabet
              avantajı kazanın.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <CheckCircle className="w-6 h-6" />,
                title: "Kolay Kullanım",
                description: "Kullanıcı dostu arayüz ile hızlıca adapte olun",
                gradient: "from-blue-600 to-cyan-600",
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Zaman Tasarrufu",
                description:
                  "Otomatik raporlama ile zamanınızı verimli kullanın",
                gradient: "from-purple-600 to-pink-600",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Verimlilik Artışı",
                description:
                  "İş süreçlerinizi optimize ederek verimliliği artırın",
                gradient: "from-pink-600 to-rose-600",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Güvenli Altyapı",
                description:
                  "Verileriniz güvenli bir şekilde saklanır ve korunur",
                gradient: "from-emerald-600 to-teal-600",
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-8 flex gap-6">
                  <div
                    className={`w-14 h-14 bg-gradient-to-r ${benefit.gradient} rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:100px_100px] animate-move-bg" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              İş Süreçlerinizi Hemen Dönüştürmeye Başlayın
            </h2>
            <p className="text-lg sm:text-xl opacity-90 mb-10">
              14 gün boyunca ücretsiz deneyin, ekibinizin verimliliğini artırın.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center h-14 px-8 font-medium text-blue-600 bg-white rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Hemen Başlayın
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                  Raporla
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                İş süreçlerinizi dijitalleştirin ve verimliliğinizi artırın.
                Modern çözümlerle işinizi bir adım öteye taşıyın.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-6">Ürün</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-300"
                  >
                    <ArrowRight className="w-4 h-4" /> Özellikler
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-300"
                  >
                    <ArrowRight className="w-4 h-4" /> Fiyatlandırma
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-300"
                  >
                    <ArrowRight className="w-4 h-4" /> Entegrasyonlar
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-6">
                Şirket
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-300"
                  >
                    <ArrowRight className="w-4 h-4" /> Hakkımızda
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-300"
                  >
                    <ArrowRight className="w-4 h-4" /> Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-300"
                  >
                    <ArrowRight className="w-4 h-4" /> Kariyer
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-6">
                Destek
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-300"
                  >
                    <ArrowRight className="w-4 h-4" /> Yardım Merkezi
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-300"
                  >
                    <ArrowRight className="w-4 h-4" /> İletişim
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-300"
                  >
                    <ArrowRight className="w-4 h-4" /> Gizlilik Politikası
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-12 pt-8 text-center">
            <p className="text-gray-600">
              &copy; {new Date().getFullYear()} Raporla. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
