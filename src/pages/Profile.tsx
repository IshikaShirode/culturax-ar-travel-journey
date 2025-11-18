import { Header } from '@/components/layout/Header';
import { FogLayer } from '@/components/effects/FogLayer';
import { HoloParticles } from '@/components/effects/HoloParticles';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Navigate } from 'react-router-dom';
import { Trophy, Target, Clock, TrendingUp } from 'lucide-react';

export default function Profile() {
  const { user, loading } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: attempts } = useQuery({
    queryKey: ['attempts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*, quizzes(title)')
        .eq('user_id', user?.id)
        .order('completed_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const totalAttempts = attempts?.length || 0;
  const avgScore = attempts?.length 
    ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
    : 0;
  const avgAccuracy = attempts?.length
    ? Math.round((attempts.reduce((sum, a) => sum + (a.correct_answers / a.total_questions * 100), 0) / attempts.length))
    : 0;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FogLayer layer={1} />
      <FogLayer layer={2} />
      <HoloParticles />
      
      <Header />

      <div className="relative z-10 pt-32 px-6 pb-20">
        <div className="container mx-auto max-w-6xl">
          {/* Profile Header */}
          <div className="glass p-8 rounded-xl mb-8 animate-slide-up">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/30 to-cyan/30 flex items-center justify-center text-4xl font-bold gold-text">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-3xl font-bold gold-text mb-2">{profile?.username}</h1>
                <p className="text-foreground/70">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-hover p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6 text-gold" />
                <h3 className="text-lg font-semibold">Average Score</h3>
              </div>
              <p className="text-4xl font-bold gold-text">{avgScore}</p>
            </div>

            <div className="glass-hover p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-6 h-6 text-cyan" />
                <h3 className="text-lg font-semibold">Accuracy</h3>
              </div>
              <p className="text-4xl font-bold text-cyan">{avgAccuracy}%</p>
            </div>

            <div className="glass-hover p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold">Quizzes Taken</h3>
              </div>
              <p className="text-4xl font-bold text-green-400">{totalAttempts}</p>
            </div>
          </div>

          {/* Recent Attempts */}
          <div className="glass p-8 rounded-xl">
            <h2 className="text-2xl font-bold gold-text mb-6">Recent Quiz Attempts</h2>
            
            {attempts && attempts.length > 0 ? (
              <div className="space-y-4">
                {attempts.slice(0, 10).map((attempt) => (
                  <div key={attempt.id} className="glass-hover p-4 rounded-lg flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground/90">
                        {attempt.quizzes?.title}
                      </h3>
                      <p className="text-sm text-foreground/60">
                        {new Date(attempt.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-2xl font-bold gold-text">{attempt.score}</p>
                        <p className="text-xs text-foreground/60">points</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold text-cyan">
                          {Math.round((attempt.correct_answers / attempt.total_questions) * 100)}%
                        </p>
                        <p className="text-xs text-foreground/60">accuracy</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-foreground/70">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{Math.floor(attempt.time_taken / 60)}m</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-foreground/60 py-8">
                No quiz attempts yet. Start your journey by taking a quiz!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
