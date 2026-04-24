import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Plus, Power, BarChart3, X, Loader2 } from "lucide-react";
import { Progress } from "../ui/progress";
import { toast } from "sonner";
import { closePoll, createPoll, fetchPolls, type Poll } from "../../api/polls";
import { supabase } from "../../api/supabase";

interface RoomPollsSettingsProps {
  roomId: string;
}

export function RoomPollsSettings({ roomId }: RoomPollsSettingsProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [closingPollId, setClosingPollId] = useState<string | null>(null);
  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["", ""],
  });

  const activePollCount = useMemo(
    () => polls.filter((poll) => poll.is_active).length,
    [polls]
  );

  const loadPolls = async (keepSpinner = false) => {
    if (!keepSpinner) {
      setLoading(true);
    }

    try {
      const data = await fetchPolls(roomId);
      setPolls(data);
    } catch (error: any) {
      console.error("Erreur chargement sondages settings:", error);
      toast.error(error?.message || "Impossible de charger les sondages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolls();

    const channel = supabase
      .channel(`settings-polls-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sondages",
          filter: `id_salon=eq.${roomId}`,
        },
        () => {
          loadPolls(true);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sondage_votes",
        },
        () => {
          loadPolls(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const handleAddOption = () => {
    if (newPoll.options.length < 5) {
      setNewPoll((current) => ({
        ...current,
        options: [...current.options, ""],
      }));
    }
  };

  const handleRemoveOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll((current) => ({
        ...current,
        options: current.options.filter((_, i) => i !== index),
      }));
    }
  };

  const handleUpdateOption = (index: number, value: string) => {
    setNewPoll((current) => ({
      ...current,
      options: current.options.map((option, i) =>
        i === index ? value : option
      ),
    }));
  };

  const resetCreateForm = () => {
    setNewPoll({ question: "", options: ["", ""] });
    setShowCreateForm(false);
  };

  const handleCreatePoll = async () => {
    if (!newPoll.question.trim()) {
      toast.error("Veuillez entrer une question");
      return;
    }

    const validOptions = newPoll.options
      .map((option) => option.trim())
      .filter(Boolean);

    if (validOptions.length < 2) {
      toast.error("Veuillez ajouter au moins 2 options");
      return;
    }

    setIsCreating(true);
    try {
      await createPoll(roomId, newPoll.question.trim(), validOptions);
      toast.success("Sondage cree avec succes");
      resetCreateForm();
      await loadPolls(true);
    } catch (error: any) {
      console.error("Erreur creation sondage:", error);
      toast.error(error?.message || "Impossible de creer le sondage");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClosePoll = async (pollId: string) => {
    setClosingPollId(pollId);
    try {
      await closePoll(pollId);
      toast.success("Sondage cloture");
      await loadPolls(true);
    } catch (error: any) {
      console.error("Erreur cloture sondage:", error);
      toast.error(error?.message || "Impossible de cloturer le sondage");
    } finally {
      setClosingPollId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Gestion des sondages</CardTitle>
            <CardDescription>
              Creez et suivez les sondages du salon ({polls.length} total,{" "}
              {activePollCount} actif{activePollCount > 1 ? "s" : ""})
            </CardDescription>
          </div>
          <Button onClick={() => setShowCreateForm((current) => !current)}>
            {showCreateForm ? (
              <X className="w-4 h-4 mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {showCreateForm ? "Annuler" : "Nouveau sondage"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showCreateForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="space-y-4">
              <div>
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  placeholder="Posez votre question..."
                  value={newPoll.question}
                  onChange={(e) =>
                    setNewPoll((current) => ({
                      ...current,
                      question: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Options de reponse</Label>
                <div className="space-y-2 mt-2">
                  {newPoll.options.map((option, index) => (
                    <div key={`${index}-${option}`} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) =>
                          handleUpdateOption(index, e.target.value)
                        }
                      />
                      {newPoll.options.length > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {newPoll.options.length < 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une option
                  </Button>
                )}
              </div>

              <Button
                onClick={handleCreatePoll}
                className="w-full"
                disabled={isCreating}
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Creer le sondage
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Aucun sondage cree</p>
            <p className="text-sm mt-2">
              Cree ton premier sondage pour lancer l'interaction
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {polls.map((poll) => {
              const totalVotes = poll.options.reduce(
                (sum, option) => sum + option.vote_count,
                0
              );

              return (
                <div
                  key={poll.id}
                  className="p-4 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-sm font-medium">{poll.question}</h4>
                        {poll.is_active ? (
                          <Badge className="bg-green-500">Actif</Badge>
                        ) : (
                          <Badge variant="secondary">Cloture</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {totalVotes} vote{totalVotes > 1 ? "s" : ""} • Par{" "}
                        {poll.creator?.username || "Utilisateur"}
                      </p>
                    </div>

                    {poll.is_active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClosePoll(poll.id)}
                        disabled={closingPollId === poll.id}
                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        {closingPollId === poll.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Power className="w-4 h-4 mr-2" />
                        )}
                        Cloturer
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {poll.options.map((option) => {
                      const percentage =
                        totalVotes > 0
                          ? (option.vote_count / totalVotes) * 100
                          : 0;

                      return (
                        <div key={option.id}>
                          <div className="flex justify-between text-sm mb-1 gap-3">
                            <span>{option.text}</span>
                            <span className="text-gray-500 whitespace-nowrap">
                              {option.vote_count} vote
                              {option.vote_count > 1 ? "s" : ""} (
                              {Math.round(percentage)}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
