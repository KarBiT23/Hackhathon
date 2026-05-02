import Link from 'next/link';
import { MapPin, Phone, Mail, Camera, Globe, Hash } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-deep-earth text-cream/90 mt-auto">
      {/* Top gradient line */}
      <div className="h-1 bg-gradient-to-r from-sunset via-warm-orange to-terracotta" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sunset via-warm-orange to-terracotta flex items-center justify-center">
                <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>K</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Kapadokya</h3>
                <p className="text-xs text-stone">El Sanatları</p>
              </div>
            </div>
            <p className="text-sm text-stone leading-relaxed">
              Kapadokya&apos;nın binlerce yıllık el sanatları geleneğini dijital dünyaya taşıyoruz. 
              Her eser, bir ustanın hikayesini taşır.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Hızlı Bağlantılar</h4>
            <ul className="space-y-2.5">
              <FooterLink href="/">Ana Sayfa</FooterLink>
              <FooterLink href="/products">Ürünler</FooterLink>
              <FooterLink href="/rfid">RFID Kart Okuma</FooterLink>
              <FooterLink href="/seller">Satıcı Paneli</FooterLink>
              <FooterLink href="/login">Giriş Yap</FooterLink>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Kategoriler</h4>
            <ul className="space-y-2.5">
              <FooterLink href="/products?category=Vazo">Vazolar</FooterLink>
              <FooterLink href="/products?category=Halı">Halılar</FooterLink>
              <FooterLink href="/products?category=Seramik">Seramikler</FooterLink>
              <FooterLink href="/products?category=Çömlek">Çömlekler</FooterLink>
              <FooterLink href="/products?category=Testi">Testiler</FooterLink>
              <FooterLink href="/products?category=Tabak">Tabaklar</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4" style={{ fontFamily: 'var(--font-display)' }}>İletişim</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-stone">
                <MapPin size={16} className="text-warm-orange mt-0.5 shrink-0" />
                <span>Göreme, Nevşehir, Kapadokya, Türkiye</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-stone">
                <Phone size={16} className="text-warm-orange shrink-0" />
                <span>+90 384 271 00 00</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-stone">
                <Mail size={16} className="text-warm-orange shrink-0" />
                <span>info@kapadokya-elsanatlari.com</span>
              </li>
            </ul>
            {/* Social */}
            <div className="flex items-center gap-3 mt-5">
              <SocialIcon icon={<Camera size={18} />} href="#" label="Instagram" />
              <SocialIcon icon={<Globe size={18} />} href="#" label="Facebook" />
              <SocialIcon icon={<Hash size={18} />} href="#" label="X" />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone/20 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone">
            © 2026 Kapadokya El Sanatları. Tüm hakları saklıdır.
          </p>
          <p className="text-xs text-stone">
            🇹🇷 Türkiye&apos;den sevgiyle yapılmıştır
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }) {
  return (
    <li>
      <Link href={href} className="text-sm text-stone hover:text-warm-orange transition-colors">
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({ icon, href }) {
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 rounded-xl bg-dark-brown/80 flex items-center justify-center text-stone hover:bg-terracotta hover:text-white transition-all"
    >
      {icon}
    </a>
  );
}
