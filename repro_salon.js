const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fzqoztminmnicezlaogr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6cW96dG1pbm1uaWNlemxhb2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTUwMjksImV4cCI6MjA3OTMzMTAyOX0.1HoZudg4YtUzd7DdeAmQ_L9z0_DuP8P6Hgbol1-H8e0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSalon() {
    console.log("1. Authenticating...");
    // Use a test account - reusing the one from auth.ts logic or creating one
    const email = `test_salon_${Date.now()}@test.com`;
    const password = "TestPassword123!";

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error("Auth Error:", authError);
        // Try login if user exists
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (loginError) {
            console.error("Login Error:", loginError);
            return;
        }
    }

    console.log("2. Syncing User...");
    const user = (await supabase.auth.getUser()).data.user;
    const { error: syncError } = await supabase
        .from('users')
        .upsert({
            id_user: user.id,
            username: "TestUserRepo",
            email: email,
            password_hash: "managed"
        }, { onConflict: 'id_user' });

    if (syncError) console.error("Sync Error:", syncError);

    console.log("3. Creating Salon...");
    const roomCode = "TESTCODE";
    // Determine video ID first
    const { data: video } = await supabase.from('video').insert({
        youtube_id: "dQw4w9WgXcQ",
        title: "Test Video"
    }).select().maybeSingle();

    const { data: salon, error: salonError } = await supabase
        .from('salon')
        .insert([{
            name: "Test Salon",
            description: "Test Description",
            is_public: true,
            owner_id: user.id,
            room_code: roomCode,
            invitation_code: roomCode,
            current_video_id: video?.id_video
        }])
        .select()
        .single();

    if (salonError) {
        console.error("Create Salon Error:", salonError);
    } else {
        console.log("Salon Created:", salon);
        console.log("Sent room_code:", roomCode);
        console.log("Received room_code:", salon.room_code);

        if (salon.room_code !== roomCode) {
            console.error("FAILURE: room_code was not saved correctly.");
        } else {
            console.log("SUCCESS: room_code saved correctly.");
        }
    }

    console.log("4. Listing Salons...");
    const { data: salons, error: listError } = await supabase
        .from('salon')
        .select('id_salon,name,description,is_public,max_participants,owner_id,current_video_id,id_playlist,room_code,invitation_code,password'); // Removed owner_name relation for simplicity first

    if (listError) {
        console.error("List Salons Error:", listError);
    } else {
        console.log(`Listed ${salons.length} salons.`);
    }
}

testSalon();
