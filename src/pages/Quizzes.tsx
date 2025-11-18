import { useMemo, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { FogLayer } from '@/components/effects/FogLayer';
import { HoloParticles } from '@/components/effects/HoloParticles';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Target, Trophy, Search, Filter } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

type Quiz = Tables<'quizzes'>;

export default function Quizzes() {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

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

  const categories = useMemo(() => {
    if (!quizzes) return [];
    const unique = new Set<string>();
    quizzes.forEach((quiz) => {
      if (quiz.category) {
        unique.add(quiz.category);
      }
    });
    return Array.from(unique);
  }, [quizzes]);

  const filteredQuizzes = useMemo(() => {
    if (!quizzes) return [];
    return quizzes.filter((quiz) => {
      const matchesSearch =
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quiz.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty =
        difficultyFilter === 'all' || quiz.difficulty?.toLowerCase() === difficultyFilter;
      const matchesCategory =
        categoryFilter === 'all' ||
        quiz.category?.toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesDifficulty && matchesCategory;
    });
  }, [quizzes, searchTerm, difficultyFilter, categoryFilter]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FogLayer layer={1} />
      <FogLayer layer={2} />
      <HoloParticles />
      
      <Header />

      <div className="relative z-10 pt-32 px-6 pb-20">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slide-up space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold gold-text gold-glow">
              Cultural Heritage Quizzes
            </h1>
            <p className="text-xl text-foreground/80">
              Test your knowledge and explore India's rich cultural heritage
            </p>
            <div className="flex flex-wrap gap-3 justify-center text-sm text-foreground/60">
              <span className="inline-flex items-center gap-2">
                <Clock className="w-4 h-4" /> Timed challenges
              </span>
              <span className="inline-flex items-center gap-2">
                <Target className="w-4 h-4" /> Skill-based tiers
              </span>
              <span className="inline-flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Earn leaderboard points
              </span>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl mb-10">
            <div className="grid md:grid-cols-[2fr,1fr,1fr,auto] gap-4 items-end">
              <div>
                <label className="text-sm text-foreground/70 flex items-center gap-2">
                  <Search className="w-4 h-4" /> Search
                </label>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Find a monument, city, or theme"
                  className="mt-2 bg-muted/40 border-border/40"
                />
              </div>
              <div>
                <label className="text-sm text-foreground/70">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="mt-2 bg-muted/40 border-border/40">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-foreground/70">Difficulty</label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {['all', 'easy', 'medium', 'hard'].map((difficulty) => (
                    <Button
                      key={difficulty}
                      type="button"
                      variant={difficultyFilter === difficulty ? 'default' : 'outline'}
                      onClick={() => setDifficultyFilter(difficulty as typeof difficultyFilter)}
                      className={`capitalize ${
                        difficultyFilter === difficulty
                          ? 'bg-cyan text-primary-foreground'
                          : 'border-border/50 text-foreground/70'
                      }`}
                    >
                      {difficulty}
                    </Button>
                  ))}
                </div>
              </div>
              {isAdmin && (
                <Link to="/admin" className="justify-self-end">
                  <Button className="bg-gradient-to-r from-gold to-gold-light text-primary-foreground">
                    + Create Quiz
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass h-64 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredQuizzes.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz, i) => (
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

                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge variant="outline" className="text-xs">
                      {quiz.time_limit ? `${Math.round(quiz.time_limit / 60)} min timer` : 'Self paced'}
                    </Badge>
                    {quiz.category && (
                      <Badge variant="secondary" className="text-xs">
                        {quiz.category}
                      </Badge>
                    )}
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
          ) : (
            <div className="text-center py-20 glass rounded-2xl">
              <Filter className="w-12 h-12 mx-auto mb-4 text-cyan" />
              <h3 className="text-2xl font-bold mb-2">No quizzes match your filters</h3>
              <p className="text-foreground/70 mb-6">
                Try changing the difficulty or category to discover more cultural journeys.
              </p>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" className="border-cyan text-cyan">
                    Add a new quiz
                  </Button>
                </Link>
              )}
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
