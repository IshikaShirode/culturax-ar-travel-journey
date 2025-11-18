import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FogLayer } from '@/components/effects/FogLayer';
import { HoloParticles } from '@/components/effects/HoloParticles';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  if (user && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      const loggedUser = data.user;
      if (!loggedUser) {
        throw new Error('Unable to verify administrator credentials.');
      }

      const { data: roleRow, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', loggedUser.id)
        .maybeSingle();

      if (roleError || roleRow?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('You are not authorized to access the admin console.');
      }

      toast({
        title: 'Admin access granted',
        description: 'Welcome back to the CulturaX command center.',
      });
      navigate('/admin', { replace: true });
    } catch (loginError) {
      toast({
        title: 'Admin login failed',
        description:
          loginError instanceof Error
            ? loginError.message
            : 'Please check your credentials and role assignment.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-6">
      <FogLayer layer={1} />
      <FogLayer layer={2} />
      <HoloParticles />

      <div className="relative z-10 w-full max-w-md glass p-10 rounded-2xl">
        <div className="text-center mb-8">
          <p className="text-sm uppercase tracking-[0.4em] text-cyan">Restricted Access</p>
          <h1 className="text-3xl font-bold gold-text gold-glow">Admin Console</h1>
          <p className="text-foreground/70 mt-2">
            Authorized curators only. All actions are logged for compliance.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 bg-muted/40 border-border/40"
              placeholder="admin@culturax.com"
            />
          </div>
          <div>
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-2 bg-muted/40 border-border/40"
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-gold to-gold-light text-primary-foreground"
          >
            {isSubmitting ? 'Validating…' : 'Enter Admin Dashboard'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

