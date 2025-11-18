import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FogLayer } from '@/components/effects/FogLayer';
import { NeonGrid } from '@/components/effects/NeonGrid';
import { HoloParticles } from '@/components/effects/HoloParticles';
import { Header } from '@/components/layout/Header';
import { BookOpen, Globe, Smartphone, Users, Zap, Shield } from 'lucide-react';

export default function Home() {
  const features = [
    { icon: <Smartphone />, title: 'Offline AR Access', desc: 'Explore monuments anytime without internet' },
    { icon: <Zap />, title: 'Marker-Based Accuracy', desc: 'Reliable AR tracking on all devices' },
    { icon: <BookOpen />, title: 'Immersive Learning', desc: 'Perfect for tourism & education' },
    { icon: <Shield />, title: 'High-Performance', desc: 'Optimized 3D models for smooth experience' },
    { icon: <Globe />, title: 'Cross-Platform', desc: 'Works seamlessly on Android & iOS' },
    { icon: <Users />, title: 'Cultural Preservation', desc: 'Digitally archiving monuments' },
  ];

  const whyCards = [
    'Offline AR experience for remote accessibility',
    '360° immersive monument reconstructions',
    'Educational platform for schools & colleges',
    'Interactive storytelling',
    'Built for low-end devices',
    'Preserves historical landmarks'
  ];

  const team = [
    { name: 'ISHWARI SHINDE', role: 'Team Lead' },
    { name: 'JAYAN GOPALE', role: 'Member' },
    { name: 'ISHIKA SHIRODE', role: 'Member' },
    { name: 'PIYUSH KULKARNI', role: 'Member' },
    { name: 'NIKITA MORE', role: 'Member' },
    { name: 'SAKET KULTHE', role: 'Member' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FogLayer layer={1} />
      <FogLayer layer={2} />
      <NeonGrid />
      <HoloParticles />
      
      <Header />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="container mx-auto text-center animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gold-text gold-glow">
            Preserving History with AR Innovation
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto mb-12 leading-relaxed">
            CulturaX brings India's cultural heritage to life using immersive Augmented Reality,
            making monuments accessible to everyone — anywhere, anytime.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/quizzes">
              <Button size="lg" className="bg-gradient-to-r from-gold to-gold-light text-primary-foreground text-lg px-8 py-6 hover:opacity-90">
                Start Quiz Journey
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button size="lg" variant="outline" className="border-cyan text-cyan hover:bg-cyan/10 text-lg px-8 py-6">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why CulturaX */}
      <section id="why" className="relative z-10 py-24 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 gold-text">
            Why CulturaX?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyCards.map((text, i) => (
              <div key={i} className="glass-hover p-6 rounded-xl text-center animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <p className="text-lg text-foreground/90">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-6 bg-muted/20">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 gold-text">
            Core Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="glass-hover p-8 rounded-xl group hover:scale-105 transition-transform duration-300">
                <div className="text-gold mb-4 group-hover:text-cyan transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 gold-text">{feature.title}</h3>
                <p className="text-foreground/80">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="relative z-10 py-24 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 gold-text">
            Meet the Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div key={i} className="glass-hover p-8 rounded-xl text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold/30 to-cyan/30 flex items-center justify-center text-3xl font-bold gold-text">
                  {member.name[0]}
                </div>
                <h3 className="text-xl font-bold mb-2 gold-text">{member.name}</h3>
                <p className="text-cyan">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 py-24 px-6 bg-muted/20">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 gold-text">
            Contact Us
          </h2>
          <p className="text-xl text-foreground/80 mb-6">
            For queries, collaborations, or access to the CulturaX platform, reach us at:
          </p>
          <p className="text-2xl gold-text">contact@culturax.com</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-border/30 text-center">
        <p className="text-foreground/60">© 2025 CulturaX • All Rights Reserved</p>
      </footer>
    </div>
  );
}
