const API_BASE = window.location.origin;

async function getRankings() {
    try {
        const response = await fetch(`${API_BASE}/api/rankings`);
        if (!response.ok) throw new Error('Failed to fetch rankings');
        return await response.json();
    } catch (error) {
        console.error('Error fetching rankings:', error);
        return [];
    }
}

async function saveScore(username, score) {
    try {
        const response = await fetch(`${API_BASE}/api/score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, score })
        });
        
        if (!response.ok) throw new Error('Failed to save score');
        return await response.json();
    } catch (error) {
        console.error('Error saving score:', error);
        return { success: false };
    }
}