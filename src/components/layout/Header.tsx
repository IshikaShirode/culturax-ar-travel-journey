import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export const Header = () => {
  const { user, signOut, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '#features', label: 'Features' },
    { href: '/quizzes', label: 'Quizzes' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/feedback', label: 'Feedback' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="text-3xl font-bold gold-text gold-glow">
            CulturaX
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground/80 hover:text-gold transition-colors"
              >
                {link.label}
              </a>
            ))}
            
            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" className="text-foreground/80 hover:text-gold">
                    Profile
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" className="text-foreground/80 hover:text-cyan">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button onClick={signOut} variant="outline" className="border-gold text-gold hover:bg-gold hover:text-primary-foreground">
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button className="bg-gradient-to-r from-gold to-gold-light text-primary-foreground hover:opacity-90">
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-4 pb-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground/80 hover:text-gold transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">Profile</Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">Admin</Button>
                  </Link>
                )}
                <Button onClick={signOut} variant="outline" className="w-full">
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-gold to-gold-light">Login</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
