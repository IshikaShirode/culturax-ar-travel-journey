import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FogLayer } from '@/components/effects/FogLayer';
import { HoloParticles } from '@/components/effects/HoloParticles';
import { Clock, CheckCircle2 } from 'lucide-react';

export default function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime] = useState(Date.now());

  const { data: quiz } = useQuery({
    queryKey: ['quiz', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: questions } = useQuery({
    queryKey: ['questions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', id)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (quiz) {
      setTimeLeft(quiz.time_limit);
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const submitAttempt = useMutation({
    mutationFn: async (score: number) => {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const correctAnswers = Object.entries(selectedAnswers).filter(
        ([idx, answer]) => questions?.[parseInt(idx)]?.correct_answer === answer
      ).length;

      const { error } = await supabase.from('quiz_attempts').insert({
        user_id: user?.id,
        quiz_id: id,
        score,
        total_questions: questions?.length || 0,
        correct_answers: correctAnswers,
        time_taken: timeTaken,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Quiz Completed!',
        description: 'Your score has been recorded',
      });
      navigate('/profile');
    },
  });

  const handleSubmit = () => {
    const correctAnswers = Object.entries(selectedAnswers).filter(
      ([idx, answer]) => questions?.[parseInt(idx)]?.correct_answer === answer
    ).length;
    
    const totalPoints = questions?.reduce((sum, q) => sum + (q.points || 10), 0) || 0;
    const score = Math.floor((correctAnswers / (questions?.length || 1)) * totalPoints);
    
    submitAttempt.mutate(score);
  };

  if (!quiz || !questions) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FogLayer layer={1} />
      <FogLayer layer={2} />
      <HoloParticles />

      <div className="relative z-10 pt-20 px-6 pb-20">
        <div className="container mx-auto max-w-3xl">
          {/* Header */}
          <div className="glass p-6 rounded-xl mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold gold-text">{quiz.title}</h1>
              <div className="flex items-center gap-2 text-foreground/80">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-foreground/60 mt-2">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>

          {/* Question */}
          <div className="glass p-8 rounded-xl mb-6">
            <h2 className="text-2xl font-bold mb-8 text-foreground/90">
              {currentQ.question_text}
            </h2>

            <div className="space-y-4">
              {['A', 'B', 'C', 'D'].map((option) => {
                const optionText = currentQ[`option_${option.toLowerCase()}` as keyof typeof currentQ] as string;
                const isSelected = selectedAnswers[currentQuestion] === option;
                
                return (
                  <button
                    key={option}
                    onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: option })}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'border-gold bg-gold/10'
                        : 'border-border/50 hover:border-gold/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-gold bg-gold text-primary-foreground' : 'border-foreground/30'
                      }`}>
                        {option}
                      </div>
                      <span className="text-foreground/90">{optionText}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            {currentQuestion === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={submitAttempt.isPending}
                className="bg-gradient-to-r from-gold to-gold-light text-primary-foreground"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {submitAttempt.isPending ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
                className="bg-gradient-to-r from-gold to-gold-light text-primary-foreground"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
