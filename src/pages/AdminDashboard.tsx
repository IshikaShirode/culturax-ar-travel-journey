import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { FogLayer } from '@/components/effects/FogLayer';
import { HoloParticles } from '@/components/effects/HoloParticles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tables } from '@/integrations/supabase/types';
import { BookPlus, LayoutDashboard, Target, Landmark, Activity } from 'lucide-react';

type Quiz = Tables<'quizzes'>;
type MonumentFormState = {
  name: string;
  location: string;
  description: string;
  significance: string;
  arMarkerUrl: string;
  era: string;
  tags: string;
};

const quizInitialState = {
  title: '',
  description: '',
  category: '',
  difficulty: 'easy',
  timeLimit: 600,
};

const monumentInitialState: MonumentFormState = {
  name: '',
  location: '',
  description: '',
  significance: '',
  arMarkerUrl: '',
  era: '',
  tags: '',
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quizForm, setQuizForm] = useState(quizInitialState);
  const [monumentForm, setMonumentForm] = useState(monumentInitialState);

  const analyticsQuery = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const [
        quizCountRes,
        monumentCountRes,
        profilesCountRes,
        feedbackCountRes,
        attemptsRes,
      ] = await Promise.all([
        supabase.from('quizzes').select('id', { count: 'exact', head: true }),
        supabase.from('monuments').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('feedback').select('id', { count: 'exact', head: true }),
        supabase.from('quiz_attempts').select('score, correct_answers, total_questions'),
      ]);

      const attempts = attemptsRes.data ?? [];
      const avgScore = attempts.length
        ? Math.round(
            attempts.reduce((sum, attempt) => sum + (attempt.score ?? 0), 0) / attempts.length,
          )
        : 0;
      const avgAccuracy = attempts.length
        ? Math.round(
            attempts.reduce((sum, attempt) => {
              const total = attempt.total_questions ?? 0;
              if (!total) return sum;
              return sum + (((attempt.correct_answers ?? 0) / total) * 100);
            }, 0) / attempts.length,
          )
        : 0;

      return {
        quizCount: quizCountRes.count ?? 0,
        monumentCount: monumentCountRes.count ?? 0,
        explorerCount: profilesCountRes.count ?? 0,
        feedbackCount: feedbackCountRes.count ?? 0,
        attemptCount: attempts.length,
        avgScore,
        avgAccuracy,
      };
    },
  });

  const quizzesQuery = useQuery({
    queryKey: ['admin-quizzes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });

  const quizMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('quizzes').insert({
        title: quizForm.title,
        description: quizForm.description,
        category: quizForm.category || 'Heritage',
        difficulty: quizForm.difficulty,
        time_limit: quizForm.timeLimit,
        is_active: true,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Quiz published',
        description: 'Your new quiz is now live for explorers.',
      });
      setQuizForm(quizInitialState);
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to publish quiz',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const monumentMutation = useMutation({
    mutationFn: async () => {
      const tags = monumentForm.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      const { error } = await supabase.from('monuments').insert({
        name: monumentForm.name,
        location: monumentForm.location,
        description: monumentForm.description,
        significance: monumentForm.significance,
        ar_marker_url: monumentForm.arMarkerUrl,
        era: monumentForm.era,
        tags: tags.length ? tags : null,
        created_by: user?.id ?? null,
        status: 'draft',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Monument added',
        description: 'New AR monument card saved successfully.',
      });
      setMonumentForm(monumentInitialState);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add monument',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const quizCompletion = useMemo(() => {
    const filledFields = Object.values(quizForm).filter((value) => value !== '' && value !== 0).length;
    return Math.round((filledFields / Object.keys(quizForm).length) * 100);
  }, [quizForm]);

  const monumentCompletion = useMemo(() => {
    const values = Object.values(monumentForm);
    const filled = values.filter((value) => value.trim() !== '').length;
    return Math.round((filled / values.length) * 100);
  }, [monumentForm]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FogLayer layer={1} />
      <FogLayer layer={2} />
      <HoloParticles />
      <Header />

      <div className="relative z-10 pt-32 px-6 pb-20">
        <div className="container mx-auto max-w-7xl space-y-10">
          <div className="text-center space-y-4">
            <p className="text-sm uppercase tracking-[0.4em] text-cyan">Admin Command</p>
            <h1 className="text-4xl md:text-5xl font-bold gold-text">CulturaX Control Center</h1>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Publish quizzes, curate monuments, and monitor explorer engagement from one secure cockpit.
            </p>
          </div>

          <Tabs defaultValue="quizzes" className="w-full">
            <TabsList className="grid md:grid-cols-3 gap-2 glass">
              <TabsTrigger value="quizzes" className="flex items-center gap-2">
                <BookPlus className="w-4 h-4" /> Quizzes
              </TabsTrigger>
              <TabsTrigger value="monuments" className="flex items-center gap-2">
                <Landmark className="w-4 h-4" /> Monuments
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Activity className="w-4 h-4" /> Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quizzes" className="mt-8">
              <div className="grid lg:grid-cols-[1fr,0.8fr] gap-8">
                <div className="glass p-8 rounded-2xl space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold gold-text">Create a New Quiz</h2>
                    <Badge variant="secondary" className="text-xs uppercase tracking-widest">
                      {quizCompletion}% ready
                    </Badge>
                  </div>
                  <form
                    className="space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      quizMutation.mutate();
                    }}
                  >
                    <div>
                      <label className="text-sm text-foreground/70">Title</label>
                      <Input
                        value={quizForm.title}
                        onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                        placeholder="Eg. The Mughal Chronicles"
                        required
                        className="mt-2 bg-muted/40 border-border/40"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-foreground/70">Description</label>
                      <Textarea
                        value={quizForm.description}
                        onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                        placeholder="Short summary that invites explorers."
                        required
                        className="mt-2 bg-muted/40 border-border/40"
                        rows={4}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-foreground/70">Category</label>
                        <Input
                          value={quizForm.category}
                          onChange={(e) => setQuizForm({ ...quizForm, category: e.target.value })}
                          placeholder="Architecture, Music, Freedom…"
                          className="mt-2 bg-muted/40 border-border/40"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-foreground/70">Difficulty</label>
                        <select
                          value={quizForm.difficulty}
                          onChange={(e) => setQuizForm({ ...quizForm, difficulty: e.target.value })}
                          className="mt-2 w-full rounded-md border border-border/40 bg-muted/40 px-3 py-2 text-foreground"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-foreground/70">Time Limit (seconds)</label>
                      <Input
                        type="number"
                        min={60}
                        value={quizForm.timeLimit}
                        onChange={(e) =>
                          setQuizForm({ ...quizForm, timeLimit: Number(e.target.value) })
                        }
                        className="mt-2 bg-muted/40 border-border/40"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={quizMutation.isPending}
                      className="w-full bg-gradient-to-r from-gold to-gold-light text-primary-foreground"
                    >
                      {quizMutation.isPending ? 'Publishing...' : 'Publish Quiz'}
                    </Button>
                  </form>
                </div>

                <div className="space-y-4">
                  <Card className="glass p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm uppercase tracking-widest text-foreground/50">
                          Launch Readiness
                        </p>
                        <h3 className="text-2xl font-bold gold-text">Quiz Blueprint</h3>
                      </div>
                      <Target className="w-8 h-8 text-cyan" />
                    </div>
                    <Progress value={quizCompletion} />
                    <p className="text-foreground/60 text-sm mt-3">
                      Fill out the details to activate the quiz creation workflow.
                    </p>
                  </Card>

                  <Card className="glass p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5 text-cyan" />
                      Latest Quizzes
                    </h3>
                    <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                      {quizzesQuery.data?.map((quiz) => (
                        <div key={quiz.id} className="border border-border/30 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold">{quiz.title}</h4>
                            <Badge variant="outline" className="capitalize">
                              {quiz.difficulty}
                            </Badge>
                          </div>
                          <p className="text-xs text-foreground/60">
                            {quiz.category} • {quiz.time_limit ? Math.round(quiz.time_limit / 60) : 0} min
                          </p>
                        </div>
                      ))}
                      {!quizzesQuery.data?.length && (
                        <p className="text-sm text-foreground/60">No quizzes published yet.</p>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="monuments" className="mt-8">
              <div className="grid lg:grid-cols-[1fr,0.7fr] gap-8">
                <div className="glass p-8 rounded-2xl space-y-6">
                  <h2 className="text-2xl font-bold gold-text">Add Monument</h2>
                  <form
                    className="space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      monumentMutation.mutate();
                    }}
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-foreground/70">Name</label>
                        <Input
                          value={monumentForm.name}
                          onChange={(e) => setMonumentForm({ ...monumentForm, name: e.target.value })}
                          required
                          className="mt-2 bg-muted/40 border-border/40"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-foreground/70">Location</label>
                        <Input
                          value={monumentForm.location}
                          onChange={(e) =>
                            setMonumentForm({ ...monumentForm, location: e.target.value })
                          }
                          className="mt-2 bg-muted/40 border-border/40"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-foreground/70">Era / Timeline</label>
                        <Input
                          value={monumentForm.era}
                          onChange={(e) => setMonumentForm({ ...monumentForm, era: e.target.value })}
                          placeholder="e.g. 15th Century"
                          className="mt-2 bg-muted/40 border-border/40"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-foreground/70">AR Marker URL</label>
                        <Input
                          value={monumentForm.arMarkerUrl}
                          onChange={(e) =>
                            setMonumentForm({ ...monumentForm, arMarkerUrl: e.target.value })
                          }
                          placeholder="https://..."
                          className="mt-2 bg-muted/40 border-border/40"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-foreground/70">Description</label>
                      <Textarea
                        value={monumentForm.description}
                        onChange={(e) =>
                          setMonumentForm({ ...monumentForm, description: e.target.value })
                        }
                        rows={3}
                        className="mt-2 bg-muted/40 border-border/40"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-foreground/70">Cultural Significance</label>
                      <Textarea
                        value={monumentForm.significance}
                        onChange={(e) =>
                          setMonumentForm({ ...monumentForm, significance: e.target.value })
                        }
                        rows={3}
                        className="mt-2 bg-muted/40 border-border/40"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-foreground/70">Tags (comma separated)</label>
                      <Input
                        value={monumentForm.tags}
                        onChange={(e) => setMonumentForm({ ...monumentForm, tags: e.target.value })}
                        placeholder="heritage, unesco, maratha..."
                        className="mt-2 bg-muted/40 border-border/40"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={monumentMutation.isPending}
                      className="w-full bg-gradient-to-r from-cyan to-cyan-light text-primary-foreground"
                    >
                      {monumentMutation.isPending ? 'Saving...' : 'Save Monument Card'}
                    </Button>
                  </form>
                </div>

                <div className="space-y-4">
                  <Card className="glass p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-widest text-foreground/60">Progress</p>
                        <h3 className="text-xl font-semibold">Monument dossier</h3>
                      </div>
                      <Badge variant="outline">{monumentCompletion}% filled</Badge>
                    </div>
                    <Progress value={monumentCompletion} className="mt-4" />
                    <p className="text-xs text-foreground/60 mt-3">
                      Capture story, timeline, location and AR marker to publish a monument.
                    </p>
                  </Card>
                  <Card className="glass p-6">
                    <h3 className="text-lg font-semibold mb-2">Tips</h3>
                    <ul className="space-y-2 text-sm text-foreground/70">
                      <li>• Use high-resolution AR markers hosted on a CDN.</li>
                      <li>• Add 3-5 tags for smart discovery.</li>
                      <li>• Share local stories for authenticity.</li>
                    </ul>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-8">
              <div className="grid lg:grid-cols-3 gap-6">
                {[
                  {
                    label: 'Published Quizzes',
                    value: analyticsQuery.data?.quizCount ?? 0,
                    accent: 'from-gold to-gold-light',
                  },
                  {
                    label: 'AR Monuments',
                    value: analyticsQuery.data?.monumentCount ?? 0,
                    accent: 'from-cyan to-blue-400',
                  },
                  {
                    label: 'Explorer Profiles',
                    value: analyticsQuery.data?.explorerCount ?? 0,
                    accent: 'from-purple-400 to-pink-400',
                  },
                ].map((stat) => (
                  <div key={stat.label} className="feature-card">
                    <p className="text-sm uppercase tracking-widest text-foreground/50">{stat.label}</p>
                    <p className="text-4xl font-bold mt-2 bg-gradient-to-r text-transparent bg-clip-text from-white to-foreground">
                      {stat.value}
                    </p>
                    <div className={`mt-6 h-1 rounded-full bg-gradient-to-r ${stat.accent}`} />
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-8 mt-8">
                <Card className="glass p-8">
                  <h3 className="text-xl font-semibold mb-6">Engagement Overview</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-foreground/60">Quiz Attempts</p>
                      <p className="text-3xl font-bold gold-text">
                        {analyticsQuery.data?.attemptCount ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60">Average Score</p>
                      <p className="text-3xl font-bold text-cyan">
                        {analyticsQuery.data?.avgScore ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60">Average Accuracy</p>
                      <p className="text-3xl font-bold text-green-400">
                        {analyticsQuery.data?.avgAccuracy ?? 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60">Feedback Received</p>
                      <p className="text-3xl font-bold text-rose-300">
                        {analyticsQuery.data?.feedbackCount ?? 0}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="glass p-8">
                  <h3 className="text-xl font-semibold mb-4">Action Center</h3>
                  <div className="space-y-4 text-sm text-foreground/70">
                    <div className="border border-border/30 rounded-xl p-4">
                      <p className="font-semibold text-foreground">Monitor explorer retention</p>
                      <p>Track weekly active quiz takers and launch rewards.</p>
                    </div>
                    <div className="border border-border/30 rounded-xl p-4">
                      <p className="font-semibold text-foreground">Spot quiz performance dips</p>
                      <p>Use accuracy % to rebalance hints or difficulty.</p>
                    </div>
                    <div className="border border-border/30 rounded-xl p-4">
                      <p className="font-semibold text-foreground">AR content health</p>
                      <p>Ensure monuments ship with location, tags, H3 descriptions.</p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

