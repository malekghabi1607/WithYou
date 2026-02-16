const supabaseUrl = "https://fzqoztminmnicezlaogr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6cW96dG1pbm1uaWNlemxhb2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTUwMjksImV4cCI6MjA3OTMzMTAyOX0.1HoZudg4YtUzd7DdeAmQ_L9z0_DuP8P6Hgbol1-H8e0";

async function testSignup() {
    const url = `${supabaseUrl}/auth/v1/signup`;
    console.log(`Testing connection to ${url}...`);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({
                email: `test_${Date.now()}@example.com`,
                password: "testpassword123",
                data: { username: "TestUser" },
                gotrue_meta_security: {}
            })
        });

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Body:", text);
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

testSignup();
