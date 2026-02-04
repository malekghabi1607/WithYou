
/**
 * Projet : WithYou
 * Fichier : components/settings/RoomPollsSettings.tsx
 *
 * Description :
 * Composant permettant de créer et gérer des sondages dans un salon.
 * Il permet d’ajouter des questions, de proposer des options
 * et de visualiser les résultats des votes des membres.
 */
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Plus, Trash2, BarChart3, Eye, X } from "lucide-react";
import { Progress } from "../ui/progress";
import { toast } from "sonner";

interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  isActive: boolean;
  createdAt: string;
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
    createdAt: "Il y a 10 min"
  },
  {
    id: "2",
    question: "À quelle heure faire la pause ?",
    options: [
      { id: "2a", text: "Maintenant", votes: 2 },
      { id: "2b", text: "Dans 30 min", votes: 6 },
      { id: "2c", text: "Pas de pause", votes: 4 }
    ],
    totalVotes: 12,
    isActive: false,
    createdAt: "Il y a 1 heure"
  }
];

interface RoomPollsSettingsProps {
  roomId: string;
}

export function RoomPollsSettings({ roomId }: RoomPollsSettingsProps) {
  const [polls, setPolls] = useState<Poll[]>(mockPolls);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["", ""]
  });

  const handleAddOption = () => {
    if (newPoll.options.length < 5) {
      setNewPoll({
        ...newPoll,
        options: [...newPoll.options, ""]
      });
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
      createdAt: "À l&apos;instant"
    };

    setPolls([poll, ...polls]);
    setNewPoll({ question: "", options: ["", ""] });
    setShowCreateForm(false);
    toast.success("Sondage créé et envoyé aux membres !");
  };

  const handleDeletePoll = (pollId: string) => {
    setPolls(polls.filter(p => p.id !== pollId));
    toast.success("Sondage supprimé");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestion des sondages</CardTitle>
            <CardDescription>
              Créez des sondages pour interagir avec les membres
            </CardDescription>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau sondage
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-900">Créer un sondage</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  placeholder="Posez votre question..."
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Options de réponse</Label>
                <div className="space-y-2 mt-2">
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleUpdateOption(index, e.target.value)}
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

              <Button onClick={handleCreatePoll} className="w-full">
                Créer le sondage
              </Button>
            </div>
          </div>
        )}

        {/* Polls List */}
        <div className="space-y-4">
          {polls.map((poll) => (
            <div
              key={poll.id}
              className="p-4 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm">{poll.question}</h4>
                    {poll.isActive ? (
                      <Badge className="bg-green-500">Actif</Badge>
                    ) : (
                      <Badge variant="secondary">Terminé</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {poll.totalVotes} votes • {poll.createdAt}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePoll(poll.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Results */}
              <div className="space-y-2">
                {poll.options.map((option) => {
                  const percentage = poll.totalVotes > 0 
                    ? (option.votes / poll.totalVotes) * 100 
                    : 0;
                  
                  return (
                    <div key={option.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{option.text}</span>
                        <span className="text-gray-500">
                          {option.votes} votes ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {polls.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Aucun sondage créé</p>
            <p className="text-sm mt-2">Créez votre premier sondage ci-dessus</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}