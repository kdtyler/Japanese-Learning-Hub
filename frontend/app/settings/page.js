'use client';

import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default function Settings() {
  const [userId, setUserId] = useState('1');
  const [duomeUsername, setDuomeUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveToken = async () => {
    const hasDuome = duomeUsername.trim().length > 0;

    if (!hasDuome) {
      setMessage('Add your Duome username to enable lessons sync.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/integrations/duolingo?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duomeUsername }),
      });

      if (response.ok) {
        setMessage('✓ Settings saved successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(`✗ Failed to save settings${errorData?.error ? `: ${errorData.error}` : ''}`);
      }
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="navbar bg-primary text-primary-content shadow-lg">
        <div className="flex-1">
          <a href="/" className="btn btn-ghost normal-case text-xl">
            Japanese Learning Hub
          </a>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="card bg-base-200 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">Duolingo Integration</h2>
            <p className="text-sm mb-4">
              Add your Duome username to sync lesson totals. Vocabulary words are imported via the browser import button on the Duolingo page — no tokens or cookies needed.
            </p>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">User ID</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="1"
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Duome Username (recommended)</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={duomeUsername}
                onChange={(e) => setDuomeUsername(e.target.value)}
                placeholder="Example: kevintyler383939"
              />
            </div>

            <button
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              onClick={handleSaveToken}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>

            {message && (
              <div className={`alert ${message.includes('✓') ? 'alert-success' : 'alert-error'} mt-4`}>
                <span>{message}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Privacy & Security</h2>
            <p className="text-sm">
              Your Duome username is stored locally and used only to fetch your public lesson stats from duome.eu.
              Vocabulary is imported directly from your browser session — no credentials are ever stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
