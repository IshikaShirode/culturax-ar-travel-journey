import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { FogLayer } from '@/components/effects/FogLayer';
import { HoloParticles } from '@/components/effects/HoloParticles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

export default function Feedback() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const submitFeedback = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('feedback').insert({
        user_id: user?.id,
        subject,
        message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Feedback Submitted!',
        description: 'Thank you for your feedback',
      });
      setSubject('');
      setMessage('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive',
      });
    },
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim() && message.trim()) {
      submitFeedback.mutate();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FogLayer layer={1} />
      <FogLayer layer={2} />
      <HoloParticles />
      
      <Header />

      <div className="relative z-10 pt-32 px-6 pb-20">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12 animate-slide-up">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gold" />
            <h1 className="text-5xl md:text-6xl font-bold mb-4 gold-text gold-glow">
              Feedback
            </h1>
            <p className="text-xl text-foreground/80">
              Help us improve CulturaX with your valuable feedback
            </p>
          </div>

          <div className="glass p-8 rounded-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  maxLength={200}
                  className="mt-2 bg-muted/50 border-border/50"
                  placeholder="What's your feedback about?"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  maxLength={1000}
                  rows={8}
                  className="mt-2 bg-muted/50 border-border/50 resize-none"
                  placeholder="Tell us your thoughts, suggestions, or report any issues..."
                />
                <p className="text-xs text-foreground/60 mt-1">
                  {message.length}/1000 characters
                </p>
              </div>

              <Button
                type="submit"
                disabled={submitFeedback.isPending}
                className="w-full bg-gradient-to-r from-gold to-gold-light text-primary-foreground hover:opacity-90"
              >
                {submitFeedback.isPending ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
