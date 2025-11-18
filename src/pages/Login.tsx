import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { FogLayer } from '@/components/effects/FogLayer';
import { HoloParticles } from '@/components/effects/HoloParticles';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'explorer' | 'admin'>('explorer');
  const navigate = useNavigate();
  const { signIn, signOut, user, isAdmin } = useAuth();
  const { toast } = useToast();

  if (user) return <Navigate to={isAdmin ? '/admin' : '/'} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'explorer') {
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Welcome back!',
          description: 'Successfully logged in',
        });
      }
      setLoading(false);
      return;
    }

    const { error, user: loggedInUser } = await signIn(email, password, { redirectTo: null });

    if (error || !loggedInUser) {
      toast({
        title: 'Admin login failed',
        description: error?.message ?? 'Unable to verify credentials',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    const { data: roleRow, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', loggedInUser.id)
      .maybeSingle();

    if (roleError || roleRow?.role !== 'admin') {
      await supabase.auth.signOut();
      await signOut();
      toast({
        title: 'Access denied',
        description: 'Your account is not authorized for admin access.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    toast({
      title: 'Admin access granted',
      description: 'Redirecting to the admin dashboard.',
    });
    navigate('/admin', { replace: true });
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
          <div className="mb-6 text-center space-y-2">
            <h2 className="text-3xl font-bold gold-text">Welcome Back</h2>
            <p className="text-sm text-foreground/60">Choose your portal to continue.</p>
            <div className="inline-flex rounded-full border border-border/50 bg-muted/40 p-1">
              {(['explorer', 'admin'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={cn(
                    'px-4 py-1 text-sm font-medium rounded-full transition-colors',
                    mode === value
                      ? 'bg-gradient-to-r from-gold to-gold-light text-primary-foreground'
                      : 'text-foreground/70',
                  )}
                >
                  {value === 'explorer' ? 'Explorer Login' : 'Admin Login'}
                </button>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="mt-2 bg-muted/50 border-border/50"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gold to-gold-light text-primary-foreground hover:opacity-90"
            >
              {loading ? 'Logging in...' : mode === 'admin' ? 'Enter Admin Console' : 'Login'}
            </Button>
          </form>

          <p className="mt-6 text-center text-foreground/70">
            Don't have an account?{' '}
            <Link to="/signup" className="text-gold hover:text-gold-light">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
