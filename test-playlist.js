async function run() {
  try {
    const email = 'testuser_' + Date.now() + '@example.com';
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email, password: 'password123' })
    });
    
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.accessToken;

    const createRes = await fetch('http://localhost:5000/api/playlists', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ name: 'My Playlist', isPublic: true })
    });
    const createData = await createRes.json();
    console.log('Create Playlist Response:', createData);
  } catch (error) {
    console.error('Error:', error);
  }
}
run();
