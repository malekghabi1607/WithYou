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
 */


import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Plus, X, BarChart3, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  isActive: boolean;
  createdBy: string;
  hasVoted?: boolean;
  userVote?: string;
}

interface PollSectionProps {
  isAdmin: boolean;
  currentUser: string;
}

const mockPolls: Poll[] = [
  {
    id: "1",
    question: "Quel film regarder ensuite ?",
    options: [
      { id: "1a", text: "Le Parrain 2", votes: 5 },
      { id: "1b", text: "Pulp Fiction", votes: 8 },
      { id: "1c", text: "Forrest Gump", votes: 3 }
    ],
    totalVotes: 16,
    isActive: true,
    createdBy: "CinePhile"
  }
];

export function PollSection({ isAdmin, currentUser }: PollSectionProps) {
  const [polls, setPolls] = useState<Poll[]>(mockPolls);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["", ""]
  });

  const handleVote = (pollId: string, optionId: string) => {
    setPolls(polls.map(poll => {
      if (poll.id === pollId) {
        return {
          ...poll,
          hasVoted: true,
          userVote: optionId,
          options: poll.options.map(opt => ({
            ...opt,
            votes: opt.id === optionId ? opt.votes + 1 : opt.votes
          })),
          totalVotes: poll.totalVotes + 1
        };
      }
      return poll;
    }));
    toast.success("Vote enregistré !");
  };

  const handleCreatePoll = () => {
    if (!newPoll.question.trim()) {
      toast.error("Veuillez entrer une question");
      return;
    }

    const validOptions = newPoll.options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      toast.error("Veuillez ajouter au moins 2 options");
      return;
    }

    const poll: Poll = {
      id: Date.now().toString(),
      question: newPoll.question,
      options: validOptions.map((text, i) => ({
        id: `${Date.now()}-${i}`,
        text,
        votes: 0
      })),
      totalVotes: 0,
      isActive: true,
      createdBy: currentUser
    };

    setPolls([poll, ...polls]);
    setNewPoll({ question: "", options: ["", ""] });
    setShowCreateForm(false);
    toast.success("Sondage créé !");
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
      {/* Header */}
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
              <Plus className="w-4 h-4 mr-1" />
              Créer
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Create Form */}
        {showCreateForm && isAdmin && (
          <Card className="p-4 bg-gray-900 border-purple-500">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white text-sm">Nouveau sondage</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="question" className="text-gray-300 text-xs">
                  Question
                </Label>
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
                          <X className="w-4 h-4" />
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
                    className="mt-2 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Ajouter une option
                  </Button>
                )}
              </div>

              <Button onClick={handleCreatePoll} size="sm" className="w-full">
                Créer le sondage
              </Button>
            </div>
          </Card>
        )}

        {/* Polls List */}
        {polls.map((poll) => (
          <Card key={poll.id} className="p-4 bg-gray-900 border-gray-700">
            <div className="mb-3">
              <div className="flex items-start justify-between mb-1">
                <h4 className="text-white text-sm flex-1">{poll.question}</h4>
                {poll.isActive && (
                  <Badge className="bg-green-500 text-xs">Actif</Badge>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {poll.totalVotes} votes • Par {poll.createdBy}
              </p>
            </div>

            <div className="space-y-2">
              {poll.options.map((option) => {
                const percentage = poll.totalVotes > 0 
                  ? (option.votes / poll.totalVotes) * 100 
                  : 0;
                
                const isUserVote = poll.userVote === option.id;

                return (
                  <div key={option.id}>
                    {!poll.hasVoted ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVote(poll.id, option.id)}
                        className="w-full justify-start text-sm"
                      >
                        {option.text}
                      </Button>
                    ) : (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-300 flex items-center gap-1">
                            {option.text}
                            {isUserVote && <CheckCircle className="w-3 h-3 text-green-500" />}
                          </span>
                          <span className="text-gray-400">
                            {option.votes} ({Math.round(percentage)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-1.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {poll.hasVoted && (
              <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Vous avez déjà voté
              </p>
            )}
          </Card>
        ))}

        {polls.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-600" />
            <p className="text-sm">Aucun sondage actif</p>
          </div>
        )}
      </div>
    </div>
  );
}
