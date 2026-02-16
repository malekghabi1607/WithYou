import { supabase } from "./supabase";

export interface Poll {
    id: string;
    question: string;
    is_active: boolean;
    created_at: string;
    id_salon: string;
    id_user: string;
    options: PollOption[];
    user_voted_option_id?: string | null;
    creator?: { username: string };
}

export interface PollOption {
    id: string;
    text: string;
    vote_count: number;
}

export async function createPoll(salonId: string, question: string, options: string[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Vous devez être connecté");

    // 1. Create the poll
    const { data: poll, error: pollError } = await supabase
        .from("sondages")
        .insert({
            id_salon: salonId,
            id_user: user.id,
            question,
            is_active: true
        })
        .select()
        .single();

    if (pollError) throw pollError;

    // 2. Create options
    const optionsPayload = options.map(text => ({
        sondage_id: poll.id,
        text
    }));

    const { error: optionsError } = await supabase
        .from("sondage_options")
        .insert(optionsPayload);

    if (optionsError) throw optionsError;

    return poll;
}

export async function fetchPolls(salonId: string): Promise<Poll[]> {
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch polls
    const { data: polls, error } = await supabase
        .from("sondages")
        .select(`
      *,
      options:sondage_options(id, text),
      creator:users!sondages_id_user_fkey(username)
    `)
        .eq("id_salon", salonId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    if (!polls) return [];

    // Fetch all votes for these polls to count them
    // (We could use .count() or a view, but fetching raw votes is okay for small scale)
    const pollIds = polls.map(p => p.id);
    const { data: votes } = await supabase
        .from("sondage_votes")
        .select("sondage_id, option_id, id_user")
        .in("sondage_id", pollIds);

    const votesByOption: Record<string, number> = {};
    const userVotes: Record<string, string> = {}; // pollId -> optionId

    votes?.forEach(v => {
        // Count votes
        votesByOption[v.option_id] = (votesByOption[v.option_id] || 0) + 1;
        // Check if current user voted
        if (user && v.id_user === user.id) {
            userVotes[v.sondage_id] = v.option_id;
        }
    });

    // Map result
    return polls.map((p: any) => ({
        ...p,
        options: p.options.map((opt: any) => ({
            ...opt,
            vote_count: votesByOption[opt.id] || 0
        })),
        user_voted_option_id: userVotes[p.id] || null
    }));
}

export async function votePoll(pollId: string, optionId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Connectez-vous pour voter");

    const { error } = await supabase
        .from("sondage_votes")
        .insert({
            sondage_id: pollId,
            option_id: optionId,
            id_user: user.id
        });

    if (error) {
        if (error.code === '23505') { // Unique violation
            throw new Error("Vous avez déjà voté pour ce sondage");
        }
        throw error;
    }
}

export async function closePoll(pollId: string) {
    const { error } = await supabase
        .from("sondages")
        .update({ is_active: false })
        .eq("id", pollId);

    if (error) throw error;
}
