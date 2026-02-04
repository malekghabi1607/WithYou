/**
 * Projet : WithYou
 * Fichier : components/room/PollSection.tsx
 *
 * Description :
 * Composant responsable de la gestion des sondages au sein d’un salon
 * de visionnage collaboratif.
 *
 * Fonctionnalités principales :
 * - Affichage des sondages actifs du salon
 * - Vote des utilisateurs sur les options proposées
 * - Affichage des résultats en temps réel (pourcentages + barres de progression)
 * - Création de nouveaux sondages (réservée à l’administrateur)
 * - Limitation du vote à une seule fois par utilisateur
 *
 * Objectif :
 * - Favoriser l’interaction entre les participants
 * - Faciliter la prise de décision collective (choix de film, pause, etc.)
 *
 * Remarque :
 * - Les données sont simulées (mock) pour le développement front-end
 * - Les actions utilisateur déclenchent des notifications via Sonner
 */import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Plus, X, BarChart3, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Poll {
  id: string;
  question: string;
  options: { text: string; votes: number }[];
  is_active: boolean;
  created_at?: string;
  creator?: { username: string };
}

interface PollSectionProps {
  isAdmin: boolean;
  currentUser: string;
  salonId: string;
}

export function PollSection({ isAdmin, currentUser, salonId }: PollSectionProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedPolls, setVotedPolls] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["", ""]
  });

  const fetchPolls = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/sondages/${salonId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPolls(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
    const interval = setInterval(fetchPolls, 5000);
    return () => clearInterval(interval);
  }, [salonId]);

  const handleVote = async (pollId: string, index: number) => {
    setVotedPolls([...votedPolls, pollId]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/sondages/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ optionIndex: index })
      });

      if (response.ok) {
        toast.success("Vote enregistré !");
        fetchPolls();
      } else {
        setVotedPolls(votedPolls.filter(id => id !== pollId));
        toast.error("Erreur lors du vote");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
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

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/sondages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id_salon: salonId,
          question: newPoll.question,
          options: validOptions
        })
      });

      if (response.ok) {
        toast.success("Sondage créé !");
        setNewPoll({ question: "", options: ["", ""] });
        setShowCreateForm(false);
        fetchPolls();
      } else {
        toast.error("Impossible de créer le sondage");
      }
    } catch (e) {
      toast.error("Erreur technique");
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
          {isAdmin && (
            <Button
              size="sm"
              onClick={() => setShowCreateForm(!showCreateForm)}
              variant="outline"
            >
              {showCreateForm ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
              {showCreateForm ? "Annuler" : "Créer"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && polls.length === 0 && (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        )}

        {showCreateForm && isAdmin && (
          <Card className="p-4 bg-gray-900 border-purple-500 animate-in slide-in-from-top-2">
            <div className="space-y-3">
              <div>
                <Label htmlFor="question" className="text-gray-300 text-xs">Question</Label>
                <Input
                  id="question"
                  placeholder="Posez votre question..."
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                  className="mt-1 bg-gray-800 border-gray-700 text-white text-sm"
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
                        className="bg-gray-800 border-gray-700 text-white text-sm"
                      />
                      {newPoll.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
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
                    className="mt-2 text-xs text-purple-400 hover:text-purple-300"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Ajouter une option
                  </Button>
                )}
              </div>

              <Button onClick={handleCreatePoll} size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                Lancer le sondage
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
          const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);
          const hasVoted = votedPolls.includes(poll.id);

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
                {poll.options.map((option, idx) => {
                  const percentage = totalVotes > 0 
                    ? (option.votes / totalVotes) * 100 
                    : 0;
                  
                  return (
                    <div key={idx} className="relative">
                      {!hasVoted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVote(poll.id, idx)}
                          disabled={!poll.is_active}
                          className="w-full justify-between text-sm h-auto py-2 border-gray-700 hover:bg-gray-800 hover:border-purple-500 transition-all"
                        >
                          <span>{option.text}</span>
                        </Button>
                      ) : (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300 font-medium">
                              {option.text}
                            </span>
                            <span className="text-gray-400">
                              {option.votes} ({Math.round(percentage)}%)
                            </span>
                          </div>
                          <Progress 
                            value={percentage} 
                            className="h-2 bg-gray-800 [&>div]:bg-purple-500" 
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