'use client';

import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default function Settings() {
  const [userId, setUserId] = useState('1');
  const [duomeUsername, setDuomeUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [waniKaniApiKey, setWaniKaniApiKey] = useState('');
  const [waniKaniLoading, setWaniKaniLoading] = useState(false);
  const [waniKaniMessage, setWaniKaniMessage] = useState('');
  const [waniKaniConfigured, setWaniKaniConfigured] = useState(false);

  useEffect(() => {
    // Check if WaniKani is already configured
    fetch(`${API_BASE}/api/integrations/wanikani/${userId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.configured) setWaniKaniConfigured(true); })
      .catch(() => {});
  }, [userId]);

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

  const handleSaveWaniKaniKey = async () => {
    if (!waniKaniApiKey.trim()) {
      setWaniKaniMessage('Enter your WaniKani API key.');
      return;
    }
    setWaniKaniLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/integrations/wanikani?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: waniKaniApiKey }),
      });
      if (response.ok) {
        setWaniKaniMessage('✓ WaniKani API key saved!');
        setWaniKaniConfigured(true);
        setWaniKaniApiKey('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setWaniKaniMessage(`✗ Failed to save${errorData?.error ? `: ${errorData.error}` : ''}`);
      }
    } catch (error) {
      setWaniKaniMessage(`✗ Error: ${error.message}`);
    } finally {
      setWaniKaniLoading(false);
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

        <div className="card bg-base-200 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">WaniKani Integration</h2>
            <p className="text-sm mb-4">
              Enter your WaniKani API v2 key to sync your SRS progress, level, and review queue.
              Generate one at{' '}
              <a
                href="https://www.wanikani.com/settings/personal_access_tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                wanikani.com/settings/personal_access_tokens
              </a>.
            </p>

            {waniKaniConfigured && (
              <div className="alert alert-success mb-3">
                <span>✓ WaniKani API key is configured. Enter a new key below to update it.</span>
              </div>
            )}

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">API Key</span>
              </label>
              <input
                type="password"
                className="input input-bordered"
                value={waniKaniApiKey}
                onChange={(e) => setWaniKaniApiKey(e.target.value)}
                placeholder={waniKaniConfigured ? 'Enter new key to update' : 'Paste your WaniKani API key'}
                autoComplete="off"
              />
            </div>

            <button
              className={`btn btn-primary ${waniKaniLoading ? 'loading' : ''}`}
              onClick={handleSaveWaniKaniKey}
              disabled={waniKaniLoading}
            >
              {waniKaniLoading ? 'Saving...' : 'Save WaniKani Key'}
            </button>

            {waniKaniMessage && (
              <div className={`alert ${waniKaniMessage.includes('✓') ? 'alert-success' : 'alert-error'} mt-4`}>
                <span>{waniKaniMessage}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Privacy &amp; Security</h2>
            <p className="text-sm">
              Your Duome username is stored locally and used only to fetch your public lesson stats from duome.eu.
              Your WaniKani API key is stored locally and used only to call the official WaniKani API on your behalf.
              Vocabulary is imported directly from your browser session — no credentials are ever stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
