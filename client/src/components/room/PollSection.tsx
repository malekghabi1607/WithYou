import { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Plus, X, BarChart3, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createPoll, fetchPolls, votePoll, Poll } from "../../api/polls";
import { supabase } from "../../api/supabase";

interface PollSectionProps {
  isAdmin: boolean;
  currentUser: string;
  salonId: string;
}

export function PollSection({ isAdmin, currentUser, salonId }: PollSectionProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["", ""]
  });

  const loadPolls = async () => {
    try {
      const data = await fetchPolls(salonId);
      setPolls(data);
    } catch (error) {
      console.error("Erreur chargement sondages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolls();

    // Subscribe to Realtime changes
    const channel = supabase
      .channel(`polls-${salonId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sondages', filter: `id_salon=eq.${salonId}` }, () => {
        loadPolls();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sondage_votes' }, () => {
        // We can't easily filter votes by salon_id directly in the subscription filter efficiently without joins,
        // but we can just reload on any vote. Optimally we'd filter, but for now this ensures correctness.
        // Actually, we can check if the vote belongs to one of our polls if we want, or just reload.
        loadPolls();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [salonId]);

  const handleVote = async (pollId: string, optionId: string) => {
    // Optimistic UI update (optional, but good for UX)
    // For now, relies on realtime reload which is fast enough
    try {
      await votePoll(pollId, optionId);
      toast.success("Vote enregistré !");
      loadPolls();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors du vote");
    }
  };

  const handleCreatePoll = async () => {
    if (!newPoll.question.trim()) {
      toast.error("Veuillez entrer une question");
      return;
    }

    const validOptions = newPoll.options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      toast.error("Veuillez ajouter au moins 2 options");
      return;
    }

    setIsCreating(true);
    try {
      await createPoll(salonId, newPoll.question, validOptions);
      toast.success("Sondage créé !");
      setNewPoll({ question: "", options: ["", ""] });
      setShowCreateForm(false);
      loadPolls();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || e.details || "Impossible de créer le sondage");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddOption = () => {
    if (newPoll.options.length < 5) {
      setNewPoll({ ...newPoll, options: [...newPoll.options, ""] });
    }
  };

  const handleRemoveOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll({
        ...newPoll,
        options: newPoll.options.filter((_, i) => i !== index)
      });
    }
  };

  const handleUpdateOption = (index: number, value: string) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({ ...newPoll, options: updatedOptions });
  };

  return (
    <div className="h-full flex flex-col bg-gray-800">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="text-white">Sondages</h3>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
            variant="outline"
            className="border-gray-600 hover:bg-gray-700 hover:text-white"
          >
            {showCreateForm ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
            {showCreateForm ? "Annuler" : "Créer"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && polls.length === 0 && (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        )}

        {showCreateForm && (
          <Card className="p-4 bg-gray-900 border-purple-500 animate-in slide-in-from-top-2">
            <div className="space-y-3">
              <div>
                <Label htmlFor="question" className="text-gray-300 text-xs">Question</Label>
                <Input
                  id="question"
                  placeholder="Posez votre question..."
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                  className="mt-1 bg-gray-800 border-gray-700 text-white text-sm focus:ring-purple-500 hover:border-gray-600"
                />
              </div>

              <div>
                <Label className="text-gray-300 text-xs">Options</Label>
                <div className="space-y-2 mt-1">
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleUpdateOption(index, e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white text-sm focus:ring-purple-500 hover:border-gray-600"
                      />
                      {newPoll.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                          className="hover:bg-red-900/20"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {newPoll.options.length < 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddOption}
                    className="mt-2 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Ajouter une option
                  </Button>
                )}
              </div>

              <Button
                onClick={handleCreatePoll}
                size="sm"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Lancer le sondage"}
              </Button>
            </div>
          </Card>
        )}

        {!loading && polls.length === 0 && !showCreateForm && (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-600 opacity-50" />
            <p className="text-sm">Aucun sondage actif</p>
          </div>
        )}

        {polls.map((poll) => {
          const totalVotes = poll.options.reduce((acc, curr) => acc + curr.vote_count, 0);
          const hasVoted = !!poll.user_voted_option_id;

          return (
            <Card key={poll.id} className="p-4 bg-gray-900 border-gray-700">
              <div className="mb-3">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-white text-sm flex-1 font-semibold">{poll.question}</h4>
                  {poll.is_active && (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">Actif</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {totalVotes} vote{totalVotes > 1 ? 's' : ''} • Par {poll.creator?.username || 'Admin'}
                </p>
              </div>

              <div className="space-y-3">
                {poll.options.map((option) => {
                  const percentage = totalVotes > 0
                    ? (option.vote_count / totalVotes) * 100
                    : 0;
                  const isUserChoice = poll.user_voted_option_id === option.id;

                  return (
                    <div key={option.id} className="relative">
                      {!hasVoted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVote(poll.id, option.id)}
                          disabled={!poll.is_active}
                          className="w-full justify-between text-sm h-auto py-2 border-gray-700 hover:bg-gray-800 hover:border-purple-500 transition-all"
                        >
                          <span>{option.text}</span>
                        </Button>
                      ) : (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className={`font-medium ${isUserChoice ? 'text-purple-400' : 'text-gray-300'}`}>
                              {option.text} {isUserChoice && "(Vous)"}
                            </span>
                            <span className="text-gray-400">
                              {option.vote_count} ({Math.round(percentage)}%)
                            </span>
                          </div>
                          <Progress
                            value={percentage}
                            className={`h-2 bg-gray-800 [&>div]:bg-purple-500 ${isUserChoice ? '[&>div]:bg-purple-400' : ''}`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {hasVoted && (
                <p className="text-[10px] text-green-500 mt-3 flex items-center gap-1 justify-end">
                  <CheckCircle className="w-3 h-3" />
                  Vote enregistré
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}