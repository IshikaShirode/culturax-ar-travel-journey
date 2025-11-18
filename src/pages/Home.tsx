import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FogLayer } from '@/components/effects/FogLayer';
import { NeonGrid } from '@/components/effects/NeonGrid';
import { HoloParticles } from '@/components/effects/HoloParticles';
import { Header } from '@/components/layout/Header';
import { BookOpen, Globe, Smartphone, Users, Zap, Shield, Compass, Sparkles, Trophy } from 'lucide-react';

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

  const impactHighlights = [
    {
      title: '5X Longer Engagement',
      detail: 'Immersive AR walkthroughs keep visitors learning for longer sessions.',
    },
    {
      title: 'Community Heritage Drives',
      detail: 'Local communities can co-create stories and preserve oral histories.',
    },
    {
      title: 'Curriculum Ready',
      detail: 'Educators get plug-and-play cultural modules aligned with NEP 2020.',
    },
  ];

  const benefitChips = [
    'Immersive field trips without travel',
    'Inclusive access for rural schools',
    'Visual storytelling for Gen-Z',
    'Instant quiz-based assessments',
    'Badge-based progress system',
    'Data-backed learning insights',
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
        <div className="absolute inset-0 pointer-events-none aura-bg" />
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

      {/* Impact */}
      <section id="why" className="relative z-10 py-24 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 gold-text">
            Cultural Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {impactHighlights.map((impact, i) => (
              <div
                key={impact.title}
                className="impact-card"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <div className="flex items-center gap-3 mb-4 text-cyan">
                  <Sparkles className="w-6 h-6" />
                  <p className="text-sm tracking-widest uppercase text-cyan/70">Impact #{i + 1}</p>
                </div>
                <h3 className="text-2xl font-semibold mb-2">{impact.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{impact.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {whyCards.map((text, i) => (
              <div
                key={text}
                className="glass-hover rounded-2xl border border-cyan/20 p-5 text-center animate-slide-up"
                style={{ animationDelay: `${0.5 + i * 0.1}s` }}
              >
                <p className="text-lg text-foreground/80">{text}</p>
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
              <div
                key={feature.title}
                className="feature-card group"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gold/40 to-cyan/40 text-gold group-hover:text-cyan transition-colors">
                    {feature.icon}
                  </span>
                  <Compass className="w-5 h-5 text-foreground/30 group-hover:text-cyan transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-3 gold-text">{feature.title}</h3>
                <p className="text-foreground/80 leading-relaxed">{feature.desc}</p>
                <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-foreground/10">
                  <div
                    className="h-full bg-gradient-to-r from-gold to-cyan animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative z-10 py-24 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            <div className="flex-1 space-y-6">
              <p className="text-sm tracking-[0.4em] uppercase text-cyan/70">Benefits</p>
              <h2 className="text-4xl md:text-5xl font-bold gold-text">
                Designed for real-world learning journeys
              </h2>
              <p className="text-lg text-foreground/70">
                CulturaX blends cinematic AR storytelling with actionable learning data.
                Each experience is handcrafted to make culture tangible, collaborative, and measurable.
              </p>
              <div className="flex flex-wrap gap-3">
                {benefitChips.map((benefit) => (
                  <span key={benefit} className="benefit-pill">
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {[
                { label: 'Cities Digitized', value: '32+', icon: <Globe className="w-6 h-6" /> },
                { label: 'Interactive Quests', value: '120+', icon: <Trophy className="w-6 h-6" /> },
                { label: 'Young Explorers', value: '15k+', icon: <Users className="w-6 h-6" /> },
                { label: 'AR Minutes Streamed', value: '280k+', icon: <Zap className="w-6 h-6" /> },
              ].map((stat, i) => (
                <div key={stat.label} className="feature-card text-center animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyan/10 text-cyan">
                    {stat.icon}
                  </div>
                  <p className="text-4xl font-bold gold-text">{stat.value}</p>
                  <p className="text-sm tracking-wide uppercase text-foreground/60">{stat.label}</p>
                </div>
              ))}
            </div>
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
