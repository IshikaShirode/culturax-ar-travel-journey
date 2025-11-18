import { Header } from '@/components/layout/Header';
import { FogLayer } from '@/components/effects/FogLayer';
import { HoloParticles } from '@/components/effects/HoloParticles';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Target, Trophy } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Quiz = Tables<'quizzes'>;

export default function Quizzes() {
  const { data: quizzes, isLoading } = useQuery<Quiz[]>({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data ?? [];
    },
  });

  const difficultyColors = {
    easy: 'text-green-400 border-green-400',
    medium: 'text-yellow-400 border-yellow-400',
    hard: 'text-red-400 border-red-400',
  };

  const getDifficultyStyle = (difficulty?: Quiz['difficulty']) => {
    const key = difficulty?.toLowerCase() as keyof typeof difficultyColors | undefined;
    return key ? difficultyColors[key] : 'text-foreground/60 border-border/60';
  };

  const formatTimeLimit = (timeLimit?: Quiz['time_limit']) => {
    if (!timeLimit || timeLimit <= 0) return 'No limit';
    const minutes = Math.max(1, Math.round(timeLimit / 60));
    return `${minutes} min`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FogLayer layer={1} />
      <FogLayer layer={2} />
      <HoloParticles />
      
      <Header />

      <div className="relative z-10 pt-32 px-6 pb-20">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 gold-text gold-glow">
              Cultural Heritage Quizzes
            </h1>
            <p className="text-xl text-foreground/80">
              Test your knowledge and explore India's rich cultural heritage
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass h-64 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes?.map((quiz, i) => (
                <div
                  key={quiz.id}
                  className="glass-hover p-6 rounded-xl animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-bold gold-text">{quiz.title}</h3>
                    <span className={`px-3 py-1 rounded-full border text-sm ${getDifficultyStyle(quiz.difficulty)}`}>
                      {quiz.difficulty ?? 'Mixed'}
                    </span>
                  </div>
                  
                  <p className="text-foreground/70 mb-6 line-clamp-2">
                    {quiz.description ?? 'Discover India’s heritage through immersive cultural challenges.'}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-foreground/60 mb-6">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeLimit(quiz.time_limit)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span>{quiz.category ?? 'General knowledge'}</span>
                    </div>
                  </div>

                  <Link to={`/quiz/${quiz.id}`}>
                    <Button className="w-full bg-gradient-to-r from-gold to-gold-light text-primary-foreground hover:opacity-90">
                      <Trophy className="w-4 h-4 mr-2" />
                      Start Quiz
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {!isLoading && quizzes?.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-foreground/60 mb-4">No quizzes available yet</p>
              <p className="text-foreground/50">Check back soon for new cultural challenges!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
