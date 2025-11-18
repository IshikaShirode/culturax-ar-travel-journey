import { Header } from '@/components/layout/Header';
import { FogLayer } from '@/components/effects/FogLayer';
import { HoloParticles } from '@/components/effects/HoloParticles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type QuizAttempt = Pick<Tables<'quiz_attempts'>, 'user_id' | 'score'> & {
  profiles?: { username: string | null } | null;
};

type LeaderboardEntry = {
  username: string;
  totalScore: number;
  attempts: number;
};

export default function Leaderboard() {
  const { data: allTime, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', 'all-time'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('user_id, score, profiles(username)')
        .order('score', { ascending: false })
        .limit(50);
      
      if (error) throw error;

      // Group by user and calculate total score
      const userScores = (data as QuizAttempt[] | null)?.reduce<Record<string, LeaderboardEntry>>(
        (acc, attempt) => {
          if (!attempt.user_id) {
            return acc;
          }

          if (!acc[attempt.user_id]) {
            acc[attempt.user_id] = {
              username: attempt.profiles?.username || 'Unknown Explorer',
              totalScore: 0,
              attempts: 0,
            };
          }

          acc[attempt.user_id].totalScore += attempt.score ?? 0;
          acc[attempt.user_id].attempts += 1;
          return acc;
        },
        {},
      ) ?? {};

      return Object.values(userScores)
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 50);
    },
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-400" />;
    return <span className="w-6 text-center font-bold text-foreground/60">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'border-yellow-400/50 bg-yellow-400/5';
    if (rank === 2) return 'border-gray-400/50 bg-gray-400/5';
    if (rank === 3) return 'border-orange-400/50 bg-orange-400/5';
    return '';
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FogLayer layer={1} />
      <FogLayer layer={2} />
      <HoloParticles />
      
      <Header />

      <div className="relative z-10 pt-32 px-6 pb-20">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12 animate-slide-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 gold-text gold-glow">
              Leaderboard
            </h1>
            <p className="text-xl text-foreground/80">
              Top performers in cultural heritage knowledge
            </p>
          </div>

          <Tabs defaultValue="all-time" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 glass">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="all-time">All Time</TabsTrigger>
            </TabsList>

            <TabsContent value="all-time" className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="glass h-20 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  {allTime?.map((entry, index) => (
                    <div
                      key={index}
                      className={`glass-hover p-6 rounded-xl flex items-center gap-6 animate-fade-in border-2 ${getRankBg(index + 1)}`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {getRankIcon(index + 1)}
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground/90">
                            {entry.username}
                          </h3>
                          <p className="text-sm text-foreground/60">
                            {entry.attempts} quiz{entry.attempts !== 1 ? 'zes' : ''} completed
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-3xl font-bold gold-text">
                          {entry.totalScore}
                        </p>
                        <p className="text-sm text-foreground/60">points</p>
                      </div>
                    </div>
                  ))}

                  {(!allTime || allTime.length === 0) && (
                    <div className="text-center py-20">
                      <p className="text-xl text-foreground/60">No leaderboard data yet</p>
                      <p className="text-foreground/50 mt-2">Be the first to take a quiz!</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="weekly" className="text-center py-20">
              <p className="text-foreground/60">Weekly leaderboard coming soon!</p>
            </TabsContent>

            <TabsContent value="monthly" className="text-center py-20">
              <p className="text-foreground/60">Monthly leaderboard coming soon!</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
