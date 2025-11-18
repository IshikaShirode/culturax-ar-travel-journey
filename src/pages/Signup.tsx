import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { FogLayer } from '@/components/effects/FogLayer';
import { HoloParticles } from '@/components/effects/HoloParticles';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();
  const { toast } = useToast();

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, username);
    
    if (error) {
      toast({
        title: 'Signup Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome to CulturaX!',
        description: 'Your account has been created',
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-6">
      <FogLayer layer={1} />
      <FogLayer layer={2} />
      <HoloParticles />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <Link to="/" className="block text-center mb-8">
          <h1 className="text-4xl font-bold gold-text gold-glow">CulturaX</h1>
        </Link>

        <div className="glass p-8 rounded-2xl">
          <h2 className="text-3xl font-bold mb-6 text-center gold-text">Join CulturaX</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-2 bg-muted/50 border-border/50"
                placeholder="culturalexplorer"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 bg-muted/50 border-border/50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-2 bg-muted/50 border-border/50"
                placeholder="••••••••"
              />
              <p className="text-xs text-muted-foreground mt-1">At least 6 characters</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gold to-gold-light text-primary-foreground hover:opacity-90"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <p className="mt-6 text-center text-foreground/70">
            Already have an account?{' '}
            <Link to="/login" className="text-gold hover:text-gold-light">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
