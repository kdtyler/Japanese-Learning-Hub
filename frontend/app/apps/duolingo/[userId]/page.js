'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default function DuolingoDetail({ params }) {
  const userId = params.userId;
  const [progress, setProgress] = useState(null);
  const [lessonsPerDay, setLessonsPerDay] = useState(5);
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingDuome, setSyncingDuome] = useState(false);
  const [importingBrowser, setImportingBrowser] = useState(false);
  const [clearingVocab, setClearingVocab] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [progressRes, vocabRes] = await Promise.all([
        fetch(`${API_BASE}/api/duolingo/progress/${userId}`),
        fetch(`${API_BASE}/api/duolingo/vocabulary/${userId}`),
      ]);

      if (progressRes.ok) {
        setProgress(await progressRes.json());
      }
      if (vocabRes.ok) {
        const data = await vocabRes.json();
        setVocabulary(data.vocabulary);
      }
    } catch (error) {
      setMessage(`Error loading data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDuomeSync = async () => {
    setSyncingDuome(true);
    try {
      const response = await fetch(`${API_BASE}/api/duolingo/sync/duome/${userId}`, {
        method: 'POST',
      });

      if (response.ok) {
        setMessage('✓ Duome lessons synced successfully!');
        await fetchData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(`✗ Failed to sync Duome lessons${errorData?.error ? `: ${errorData.error}` : ''}`);
      }
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setSyncingDuome(false);
    }
  };

  const handleBrowserImport = async () => {
    setImportingBrowser(true);
    try {
      const response = await fetch('/api/duolingo/browser-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(userId) }),
      });

      const payload = await response.json().catch(() => ({}));
      if (response.ok) {
        setMessage(`✓ Browser import complete. Imported ${payload.imported ?? 0} new words (${payload.captured ?? 0} captured).`);
        await fetchData();
      } else {
        setMessage(`✗ Browser import failed${payload?.error ? `: ${payload.error}` : ''}`);
      }
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setImportingBrowser(false);
    }
  };

  const handleClearVocabulary = async () => {
    if (!confirm('Delete all saved Duolingo vocabulary for this user? This cannot be undone.')) return;
    setClearingVocab(true);
    try {
      const response = await fetch(`${API_BASE}/api/duolingo/vocabulary/${userId}`, { method: 'DELETE' });
      const payload = await response.json().catch(() => ({}));
      if (response.ok) {
        setMessage(`✓ Cleared ${payload.deleted ?? 0} vocabulary items.`);
        await fetchData();
      } else {
        setMessage('✗ Failed to clear vocabulary.');
      }
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setClearingVocab(false);
    }
  };

  const totalCompleted = progress?.totalLessonsCompleted;
  const totalAvailable = progress?.totalLessonsAvailable;
  const hasLessonTotals = Number.isInteger(totalCompleted) && Number.isInteger(totalAvailable) && totalAvailable >= totalCompleted;
  const lessonsRemaining = hasLessonTotals ? totalAvailable - totalCompleted : null;
  const estimatedDays = hasLessonTotals && lessonsPerDay > 0 ? lessonsRemaining / lessonsPerDay : null;
  const estimatedWeeks = estimatedDays !== null ? estimatedDays / 7 : null;
  const estimatedMonths = estimatedDays !== null ? estimatedDays / 30.44 : null;

  return (
    <div className="min-h-screen bg-base-100">
      <div className="navbar bg-primary text-primary-content shadow-lg">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost normal-case text-xl">
            Japanese Learning Hub
          </Link>
        </div>
        <div className="flex-none">
          <Link href="/apps" className="btn btn-ghost">
            Back to Apps
          </Link>
        </div>
      </div>

      <div className="p-4 max-w-5xl mx-auto py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">🌲 Duolingo</h1>
            <p className="text-lg text-base-content/70">Your learning progress</p>
          </div>
          <div className="flex gap-2">
            <button
              className={`btn btn-primary ${syncingDuome ? 'loading' : ''}`}
              onClick={handleDuomeSync}
              disabled={syncingDuome}
            >
              {syncingDuome ? 'Syncing...' : 'Sync Duome Lessons'}
            </button>
            <button
              className={`btn btn-accent ${importingBrowser ? 'loading' : ''}`}
              onClick={handleBrowserImport}
              disabled={syncingDuome || importingBrowser || clearingVocab}
            >
              {importingBrowser ? 'Importing...' : 'Import Words from Browser'}
            </button>
            <button
              className={`btn btn-error btn-outline ${clearingVocab ? 'loading' : ''}`}
              onClick={handleClearVocabulary}
              disabled={syncingDuome || importingBrowser || clearingVocab}
            >
              {clearingVocab ? 'Clearing...' : 'Clear Vocabulary'}
            </button>
          </div>
        </div>

        <div className="alert alert-info mb-6">
          <span>
            Browser import opens a local browser window and captures learned lexemes from your logged-in Duolingo session,
            so you do not need to store bearer tokens or cookies for this path.
          </span>
        </div>

        {message && (
          <div className={`alert ${message.includes('✓') ? 'alert-success' : 'alert-error'} mb-6`}>
            <span>{message}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : progress ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-figure text-primary">📚</div>
                <div className="stat-title">Vocabulary Learned</div>
                <div className="stat-value">{progress.totalVocabularyLearned || 0}</div>
              </div>

              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-figure text-info">🧩</div>
                <div className="stat-title">Lessons Completed</div>
                <div className="stat-value">{hasLessonTotals ? `${totalCompleted}/${totalAvailable}` : 'N/A'}</div>
              </div>

              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-figure text-secondary">✨</div>
                <div className="stat-title">Total XP</div>
                <div className="stat-value">{progress.totalXp || 'N/A'}</div>
              </div>

              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-figure text-accent">🔥</div>
                <div className="stat-title">Current Streak</div>
                <div className="stat-value">{progress.currentStreak || 0} days</div>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl mb-8">
              <div className="card-body">
                <h2 className="card-title">Completion Estimator</h2>
                {hasLessonTotals ? (
                  <>
                    <p className="text-sm text-base-content/70">
                      Choose a lessons/day pace to estimate how long it will take to finish.
                    </p>
                    <div className="mt-3">
                      <label className="label">
                        <span className="label-text">Lessons per day: {lessonsPerDay}</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={lessonsPerDay}
                        onChange={(e) => setLessonsPerDay(Number(e.target.value))}
                        className="range range-primary"
                      />
                      <div className="w-full flex justify-between text-xs px-2 mt-1">
                        <span>1</span>
                        <span>10</span>
                        <span>20</span>
                        <span>30</span>
                      </div>
                    </div>
                    <div className="mt-4 text-sm">
                      <p>Remaining lessons: {lessonsRemaining}</p>
                      <p>
                        Estimated completion: {estimatedDays?.toFixed(1)} days
                        ({estimatedWeeks?.toFixed(1)} weeks, {estimatedMonths?.toFixed(1)} months)
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-base-content/70">
                    Lesson total is not available yet. Add your Duome username in Settings and sync.
                  </p>
                )}
              </div>
            </div>

            {/* Vocabulary List */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-4">Vocabulary ({vocabulary.length})</h2>
                {vocabulary.length > 0 ? (
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="table table-compact w-full">
                      <thead className="sticky top-0 bg-base-200">
                        <tr>
                          <th>Word</th>
                          <th>Meaning</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vocabulary.map((item) => (
                          <tr key={item.id}>
                            <td className="font-semibold">{item.word}</td>
                            <td>{item.meaning || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-base-content/60">No vocabulary data yet. Sync your data above.</p>
                )}
              </div>
            </div>

            {/* Last Sync Info */}
            <div className="mt-8 text-sm text-base-content/60 text-center">
              Last synced: {progress.snapshotTime ? new Date(progress.snapshotTime).toLocaleString() : 'Never'}
            </div>
          </>
        ) : (
          <div className="alert alert-warning">
            <span>No data found. Add your Duome username in Settings, then use "Sync Duome Lessons". Use "Sync Duolingo Vocab" only when you have advanced Duolingo auth configured.</span>
          </div>
        )}
      </div>
    </div>
  );
}
