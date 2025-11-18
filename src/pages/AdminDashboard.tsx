import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import { FogLayer } from '@/components/effects/FogLayer';
import { HoloParticles } from '@/components/effects/HoloParticles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tables } from '@/integrations/supabase/types';
import {
  Activity,
  BookPlus,
  Eye,
  FileJson,
  Landmark,
  LayoutDashboard,
  Pencil,
  Target,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Quiz = Tables<'quizzes'>;
type OptionKey = 'A' | 'B' | 'C' | 'D';

type ParsedQuestion = {
  prompt: string;
  options: Record<OptionKey, string>;
  correctAnswer: OptionKey;
  points?: number;
};

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

const sampleQuestionSet = [
  {
    question: 'Who commissioned the Taj Mahal?',
    options: {
      A: 'Akbar',
      B: 'Shah Jahan',
      C: 'Aurangzeb',
      D: 'Humayun',
    },
    answer: 'B',
    points: 10,
  },
  {
    question: 'Ellora caves are famous for which blend of faiths?',
    options: {
      A: 'Hindu, Buddhist, Jain',
      B: 'Christian & Islamic',
      C: 'Sikh & Buddhist',
      D: 'Hindu & Christian',
    },
    answer: 'A',
    points: 10,
  },
];

const parseQuestionJson = (raw: unknown): ParsedQuestion[] => {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error('JSON must be an array of question objects.');
  }

  return raw.map((entry, index) => {
    const candidate = entry as Record<string, unknown>;
    const questionText =
      (candidate.question ??
        candidate.prompt ??
        candidate.question_text ??
        candidate.title) as string | undefined;

    if (!questionText || typeof questionText !== 'string') {
      throw new Error(`Question #${index + 1} is missing a "question" field.`);
    }

    const optionsSource =
      (candidate.options as Record<string, string> | undefined) ??
      ({
        A: candidate.optionA ?? candidate.option_a,
        B: candidate.optionB ?? candidate.option_b,
        C: candidate.optionC ?? candidate.option_c,
        D: candidate.optionD ?? candidate.option_d,
      } as Record<string, unknown>);

    const normalizedOptions = ['A', 'B', 'C', 'D'].reduce((acc, key) => {
      const optionValue = optionsSource?.[key] ?? optionsSource?.[key.toLowerCase()];
      if (!optionValue || typeof optionValue !== 'string') {
        throw new Error(`Question #${index + 1} is missing option ${key}.`);
      }
      return { ...acc, [key]: optionValue.trim() };
    }, {} as Record<OptionKey, string>);

    const answerRaw =
      (candidate.answer ??
        candidate.correctAnswer ??
        candidate.correct_answer ??
        candidate.solution) as string | undefined;
    const normalizedAnswer = answerRaw?.trim().toUpperCase();

    if (!normalizedAnswer || !['A', 'B', 'C', 'D'].includes(normalizedAnswer)) {
      throw new Error(`Question #${index + 1} has an invalid correct answer.`);
    }

    return {
      prompt: questionText.trim(),
      options: normalizedOptions,
      correctAnswer: normalizedAnswer as OptionKey,
      points: typeof candidate.points === 'number' ? candidate.points : undefined,
    };
  });
};

const mapQuestionRows = (rows: Tables<'questions'>[]): ParsedQuestion[] =>
  rows
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((row) => ({
      prompt: row.question_text,
      options: {
        A: row.option_a,
        B: row.option_b,
        C: row.option_c,
        D: row.option_d,
      },
      correctAnswer: (row.correct_answer ?? 'A') as OptionKey,
      points: row.points ?? undefined,
    }));

const downloadJson = (payload: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [quizForm, setQuizForm] = useState(quizInitialState);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [questionsPreview, setQuestionsPreview] = useState<ParsedQuestion[]>([]);
  const [questionFileName, setQuestionFileName] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [previewQuestions, setPreviewQuestions] = useState<ParsedQuestion[] | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [monumentForm, setMonumentForm] = useState(monumentInitialState);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const analyticsQuery = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const [quizCountRes, monumentCountRes, profilesCountRes, feedbackCountRes, attemptsRes] =
        await Promise.all([
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
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
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

  const upsertQuizMutation = useMutation({
    mutationFn: async () => {
      if (!questionsPreview.length) {
        throw new Error('Please import a JSON file that contains quiz questions.');
      }

      let quizId = editingQuizId;
      const payload = {
        title: quizForm.title,
        description: quizForm.description,
        category: quizForm.category || 'Heritage',
        difficulty: quizForm.difficulty,
        time_limit: quizForm.timeLimit,
        is_active: true,
        created_by: user?.id ?? null,
      };

      if (quizId) {
        const { error } = await supabase.from('quizzes').update(payload).eq('id', quizId);
        if (error) throw error;
        await supabase.from('questions').delete().eq('quiz_id', quizId);
      } else {
        const { data, error } = await supabase
          .from('quizzes')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        quizId = data.id;
      }

      const questionRows = questionsPreview.map((question, index) => ({
        quiz_id: quizId,
        question_text: question.prompt,
        option_a: question.options.A,
        option_b: question.options.B,
        option_c: question.options.C,
        option_d: question.options.D,
        correct_answer: question.correctAnswer,
        order_index: index,
        points: question.points ?? 10,
      }));

      const { error: questionError } = await supabase.from('questions').insert(questionRows);
      if (questionError) throw questionError;

      return quizId;
    },
    onSuccess: (quizId) => {
      toast({
        title: editingQuizId ? 'Quiz updated' : 'Quiz published',
        description: editingQuizId
          ? 'Questions replaced with your latest JSON import.'
          : 'Your new quiz is now live for explorers.',
      });
      setQuizForm(quizInitialState);
      setQuestionsPreview([]);
      setQuestionFileName('');
      setEditingQuizId(null);
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Quiz save failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId: string) => {
      await supabase.from('questions').delete().eq('quiz_id', quizId);
      const { error } = await supabase.from('quizzes').delete().eq('id', quizId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Quiz removed',
        description: 'Quiz and its questions have been deleted.',
      });
      if (editingQuizId) {
        setEditingQuizId(null);
        setQuizForm(quizInitialState);
        setQuestionsPreview([]);
        setQuestionFileName('');
      }
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const quizCompletion = useMemo(() => {
    const filled = Object.values(quizForm).filter((value) => value !== '' && value !== 0).length;
    return Math.round((filled / Object.values(quizForm).length) * 100);
  }, [quizForm]);

  const monumentCompletion = useMemo(() => {
    const filled = Object.values(monumentForm).filter((value) => value.trim() !== '').length;
    return Math.round((filled / Object.values(monumentForm).length) * 100);
  }, [monumentForm]);

  const handleJsonUpload = async (file?: File) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseQuestionJson(JSON.parse(text));
      setQuestionsPreview(parsed);
      setQuestionFileName(file.name);
      setJsonError(null);
    } catch (error) {
      setQuestionsPreview([]);
      setQuestionFileName('');
      setJsonError(
        error instanceof Error ? error.message : 'Unable to parse JSON. Please check the format.',
      );
    }
  };

  const handleEditQuiz = async (quiz: Quiz) => {
    setQuizForm({
      title: quiz.title,
      description: quiz.description ?? '',
      category: quiz.category ?? '',
      difficulty: quiz.difficulty ?? 'easy',
      timeLimit: quiz.time_limit ?? 600,
    });
    setEditingQuizId(quiz.id);
    setQuestionFileName('');
    setJsonError(null);

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quiz.id)
      .order('order_index', { ascending: true });

    if (error) {
      toast({
        title: 'Unable to load questions',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setQuestionsPreview(mapQuestionRows(data ?? []));
  };

  const handlePreviewQuiz = async (quiz: Quiz) => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quiz.id)
      .order('order_index', { ascending: true });

    if (error) {
      toast({
        title: 'Unable to fetch quiz data',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    const parsed = mapQuestionRows(data ?? []);
    setPreviewQuestions(parsed);
    setPreviewTitle(quiz.title);
    setIsPreviewOpen(true);
  };

  const handleQuizSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    upsertQuizMutation.mutate();
  };

  const resetQuizForm = () => {
    setQuizForm(quizInitialState);
    setQuestionsPreview([]);
    setQuestionFileName('');
    setEditingQuizId(null);
    setJsonError(null);
  };

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
              Publish quizzes from JSON, curate monuments, and monitor explorer engagement from one
              secure cockpit.
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

            <TabsContent value="quizzes" className="mt-8 space-y-8">
              <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-8">
                <div className="glass p-8 rounded-2xl space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-foreground/60">
                        {editingQuizId ? 'Update Quiz' : 'Create Quiz'}
                      </p>
                      <h2 className="text-2xl font-bold gold-text">
                        {editingQuizId ? 'Edit Quiz' : 'New Quiz Blueprint'}
                      </h2>
                    </div>
                    <Badge variant="outline">{quizCompletion}% ready</Badge>
                  </div>

                  <form onSubmit={handleQuizSubmit} className="space-y-5">
                    <div>
                      <Label className="text-sm text-foreground/70">Title</Label>
                      <Input
                        value={quizForm.title}
                        onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                        required
                        placeholder="Eg. The Mughal Chronicles"
                        className="mt-2 bg-muted/40 border-border/40"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-foreground/70">Description</Label>
                      <Textarea
                        value={quizForm.description}
                        onChange={(e) =>
                          setQuizForm({ ...quizForm, description: e.target.value })
                        }
                        required
                        rows={4}
                        placeholder="Short summary that invites explorers."
                        className="mt-2 bg-muted/40 border-border/40"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-foreground/70">Category</Label>
                        <Input
                          value={quizForm.category}
                          onChange={(e) => setQuizForm({ ...quizForm, category: e.target.value })}
                          placeholder="Architecture, Music, Freedom..."
                          className="mt-2 bg-muted/40 border-border/40"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-foreground/70">Difficulty</Label>
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
                      <Label className="text-sm text-foreground/70">Time Limit (seconds)</Label>
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

                    <div className="rounded-2xl border border-dashed border-border/60 p-4 space-y-3 bg-muted/20">
                      <div className="flex items-center gap-3 text-sm text-foreground/70">
                        <UploadCloud className="w-5 h-5 text-cyan" />
                        <div>
                          <p className="font-semibold text-foreground">Upload question JSON</p>
                          <p>Each quiz derives its questions and answers from a JSON file.</p>
                        </div>
                      </div>
                      <Input
                        type="file"
                        accept="application/json"
                        onChange={(event) => handleJsonUpload(event.target.files?.[0])}
                        className="bg-transparent border-border/40 cursor-pointer"
                      />
                      {questionFileName && (
                        <p className="text-xs text-foreground/60">Loaded: {questionFileName}</p>
                      )}
                      {jsonError && <p className="text-xs text-red-400">{jsonError}</p>}
                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            downloadJson(sampleQuestionSet, 'culturax-quiz-template.json')
                          }
                        >
                          <FileJson className="w-4 h-4 mr-2" />
                          Download template
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadJson(questionsPreview, 'quiz-preview.json')}
                          disabled={!questionsPreview.length}
                        >
                          Preview JSON
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="submit"
                        disabled={upsertQuizMutation.isLoading}
                        className="bg-gradient-to-r from-gold to-gold-light text-primary-foreground"
                      >
                        {upsertQuizMutation.isLoading
                          ? 'Saving...'
                          : editingQuizId
                            ? 'Update Quiz'
                            : 'Publish Quiz'}
                      </Button>
                      {editingQuizId && (
                        <Button type="button" variant="outline" onClick={resetQuizForm}>
                          Cancel edit
                        </Button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="space-y-6">
                  <Card className="glass p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-widest text-foreground/60">
                          Progress
                        </p>
                        <h3 className="text-xl font-semibold">Question readiness</h3>
                      </div>
                      <Target className="w-8 h-8 text-cyan" />
                    </div>
                    <Progress value={quizCompletion} className="mt-4" />
                    <p className="text-xs text-foreground/60 mt-3">
                      Upload JSON to unlock question preview & publishing.
                    </p>
                  </Card>

                  <Card className="glass p-6">
                    <h3 className="text-lg font-semibold mb-4">Question preview</h3>
                    {questionsPreview.length ? (
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                        {questionsPreview.map((question, index) => (
                          <div key={`${question.prompt}-${index}`} className="border border-border/40 rounded-xl p-3">
                            <p className="text-sm font-semibold text-foreground/90">
                              Q{index + 1}. {question.prompt}
                            </p>
                            <p className="text-xs text-foreground/60 mt-1">
                              Correct: {question.correctAnswer} • {question.points ?? 10} points
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/60">
                        Import a JSON file to preview options and answers.
                      </p>
                    )}
                  </Card>
                </div>
              </div>

              <div className="glass p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Published quizzes</h3>
                  <Badge variant="secondary">{quizzesQuery.data?.length ?? 0}</Badge>
                </div>

                <div className="space-y-3">
                  {quizzesQuery.data?.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="border border-border/40 rounded-2xl p-4 flex flex-wrap gap-4 justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-foreground/90">{quiz.title}</p>
                        <p className="text-xs text-foreground/60">
                          {quiz.category ?? 'General'} • {quiz.difficulty ?? 'easy'} •{' '}
                          {quiz.time_limit ? Math.round(quiz.time_limit / 60) : 0} min timer
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreviewQuiz(quiz)}
                        >
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditQuiz(quiz)}>
                          <Pencil className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteQuizMutation.mutate(quiz.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}

                  {!quizzesQuery.data?.length && (
                    <p className="text-sm text-foreground/60 text-center py-6">
                      No quizzes published yet.
                    </p>
                  )}
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
                        <Label>Name</Label>
                        <Input
                          value={monumentForm.name}
                          onChange={(e) => setMonumentForm({ ...monumentForm, name: e.target.value })}
                          required
                          className="mt-2 bg-muted/40 border-border/40"
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
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
                        <Label>Era / Timeline</Label>
                        <Input
                          value={monumentForm.era}
                          onChange={(e) => setMonumentForm({ ...monumentForm, era: e.target.value })}
                          placeholder="e.g. 15th Century"
                          className="mt-2 bg-muted/40 border-border/40"
                        />
                      </div>
                      <div>
                        <Label>AR Marker URL</Label>
                        <Input
                          value={monumentForm.arMarkerUrl}
                          onChange={(e) =>
                            setMonumentForm({ ...monumentForm, arMarkerUrl: e.target.value })
                          }
                          placeholder="https://...."
                          className="mt-2 bg-muted/40 border-border/40"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
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
                      <Label>Cultural Significance</Label>
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
                      <Label>Tags (comma separated)</Label>
                      <Input
                        value={monumentForm.tags}
                        onChange={(e) => setMonumentForm({ ...monumentForm, tags: e.target.value })}
                        placeholder="heritage, unesco, maratha..."
                        className="mt-2 bg-muted/40 border-border/40"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={monumentMutation.isLoading}
                      className="w-full bg-gradient-to-r from-cyan to-cyan-light text-primary-foreground"
                    >
                      {monumentMutation.isLoading ? 'Saving...' : 'Save Monument Card'}
                    </Button>
                  </form>
                </div>

                <div className="space-y-4">
                  <Card className="glass p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-widest text-foreground/60">
                          Progress
                        </p>
                        <h3 className="text-xl font-semibold">Monument dossier</h3>
                      </div>
                      <Badge variant="outline">{monumentCompletion}% filled</Badge>
                    </div>
                    <Progress value={monumentCompletion} className="mt-4" />
                    <p className="text-xs text-foreground/60 mt-3">
                      Capture story, timeline, location and AR marker to publish a monument.
                    </p>
                  </Card>
                  <Card className="glass p-6 space-y-2 text-sm text-foreground/70">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-gold" />
                      Quick tips
                    </h3>
                    <p>• Use high-resolution AR markers hosted on a CDN.</p>
                    <p>• Add 3-5 tags for smarter discovery.</p>
                    <p>• Blend factual history with local storytelling.</p>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-8 space-y-8">
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
                    <p className="text-sm uppercase tracking-widest text-foreground/50">
                      {stat.label}
                    </p>
                    <p className="text-4xl font-bold mt-2 bg-gradient-to-r text-transparent bg-clip-text from-white to-foreground">
                      {stat.value}
                    </p>
                    <div className={`mt-6 h-1 rounded-full bg-gradient-to-r ${stat.accent}`} />
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
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

                <Card className="glass p-8 space-y-4 text-sm text-foreground/70">
                  <h3 className="text-xl font-semibold">Action Center</h3>
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
                    <p>Ensure monuments ship with location, tags, and authentic narratives.</p>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quiz: {previewTitle}</DialogTitle>
          </DialogHeader>
          {previewQuestions?.length ? (
            <div className="space-y-4">
              {previewQuestions.map((question, index) => (
                <div key={`${question.prompt}-${index}`} className="border border-border/30 rounded-xl p-4">
                  <p className="font-semibold">
                    Q{index + 1}. {question.prompt}
                  </p>
                  <ul className="mt-2 text-sm text-foreground/80 space-y-1">
                    {(['A', 'B', 'C', 'D'] as OptionKey[]).map((optionKey) => (
                      <li key={optionKey}>
                        <span className={optionKey === question.correctAnswer ? 'text-cyan font-semibold' : ''}>
                          {optionKey}. {question.options[optionKey]}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-foreground/60 mt-2">
                    Correct answer: {question.correctAnswer} • {question.points ?? 10} points
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground/60">No questions available for this quiz.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;

