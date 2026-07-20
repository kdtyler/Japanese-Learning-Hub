'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const TOTAL_WK_ITEMS = 9226;

const SRS_STAGES = [
  { label: 'Apprentice', key: 'apprenticeCount', color: '#f100a1' },
  { label: 'Guru',       key: 'guruCount',       color: '#882d9e' },
  { label: 'Master',     key: 'masterCount',     color: '#294ddb' },
  { label: 'Enlightened',key: 'enlightenedCount',color: '#0093af' },
  { label: 'Burned',     key: 'burnedCount',     color: '#434343' },
];

export default function WaniKaniDetail({ params }) {
  const userId = params.userId;
  const [progress, setProgress] = useState(null);
  const [vocabulary, setVocabulary] = useState([]);
  const [lessonsPerDay, setLessonsPerDay] = useState(15);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const [progressRes, vocabRes] = await Promise.all([
        fetch(`${API_BASE}/api/wanikani/progress/${userId}`),
        fetch(`${API_BASE}/api/wanikani/vocabulary/${userId}`),
      ]);
      if (progressRes.ok) {
        setProgress(await progressRes.json());
      }
      if (vocabRes.ok) {
        const data = await vocabRes.json();
        setVocabulary(data.vocabulary ?? []);
      }
    } catch (error) {
      setMessage(`Error loading data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/wanikani/sync/${userId}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setProgress(data);
        setMessage('✓ WaniKani data synced successfully!');
        // Refresh vocabulary separately (sync updates it server-side)
        fetch(`${API_BASE}/api/wanikani/vocabulary/${userId}`)
          .then((r) => r.ok ? r.json() : null)
          .then((d) => { if (d) setVocabulary(d.vocabulary ?? []); })
          .catch(() => {});
      } else {
        const errorData = await res.json().catch(() => ({}));
        setMessage(`✗ Sync failed${errorData?.error ? `: ${errorData.error}` : ''}`);
      }
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const itemsStarted = progress?.itemsStarted ?? 0;
  const itemsRemaining = Math.max(0, TOTAL_WK_ITEMS - itemsStarted);
  const estimatedDays = lessonsPerDay > 0 ? itemsRemaining / lessonsPerDay : null;
  const estimatedWeeks = estimatedDays !== null ? estimatedDays / 7 : null;
  const estimatedMonths = estimatedDays !== null ? estimatedDays / 30.44 : null;

  const daysOnWaniKani =
    progress?.startedAt
      ? Math.floor((Date.now() - progress.startedAt) / (1000 * 60 * 60 * 24))
      : null;

  const levelProgressions = (() => {
    try { return JSON.parse(progress?.levelProgressionsJson || '[]'); }
    catch { return []; }
  })();

  const srsLabel = (stage) => {
    if (stage >= 1 && stage <= 4) return { label: 'Apprentice', color: '#f100a1' };
    if (stage === 5 || stage === 6) return { label: 'Guru', color: '#882d9e' };
    if (stage === 7) return { label: 'Master', color: '#294ddb' };
    if (stage === 8) return { label: 'Enlightened', color: '#0093af' };
    if (stage === 9) return { label: 'Burned', color: '#434343' };
    return { label: 'Unknown', color: '#888' };
  };

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
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold">🦀 WaniKani</h1>
            <p className="text-lg text-base-content/70">Your learning progress</p>
          </div>
          <button
            className={`btn btn-primary ${syncing ? 'loading' : ''}`}
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? 'Syncing...' : 'Sync WaniKani'}
          </button>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-figure text-primary">⛩️</div>
                <div className="stat-title">Current Level</div>
                <div className="stat-value">{progress.level ?? '—'}</div>
                <div className="stat-desc">out of 60</div>
              </div>
              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-figure text-info">📅</div>
                <div className="stat-title">Days on WaniKani</div>
                <div className="stat-value">{daysOnWaniKani !== null ? daysOnWaniKani : '—'}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-figure text-success">📖</div>
                <div className="stat-title">Lessons Available</div>
                <div className="stat-value">{progress.lessonsAvailable ?? 0}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-figure text-warning">🔔</div>
                <div className="stat-title">Reviews Available</div>
                <div className="stat-value">{progress.reviewsAvailable ?? 0}</div>
              </div>
            </div>

            {/* SRS Breakdown */}
            <div className="card bg-base-200 shadow-xl mb-8">
              <div className="card-body">
                <h2 className="card-title mb-4">SRS Breakdown</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {SRS_STAGES.map(({ label, key, color }) => (
                    <div
                      key={label}
                      className="rounded-lg p-4 text-center text-white"
                      style={{ backgroundColor: color }}
                    >
                      <div className="text-2xl font-bold">
                        {(progress[key] ?? 0).toLocaleString()}
                      </div>
                      <div className="text-sm mt-1 opacity-90">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-base-content/60">
                  Total items started:{' '}
                  <span className="font-semibold">{itemsStarted.toLocaleString()}</span>{' '}
                  / {TOTAL_WK_ITEMS.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Progress by Type */}
            <div className="card bg-base-200 shadow-xl mb-8">
              <div className="card-body">
                <h2 className="card-title mb-4">Progress by Type (Guru+)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-figure text-primary text-xl">⬡</div>
                    <div className="stat-title">Radicals</div>
                    <div className="stat-value text-primary">
                      {(progress.radicalsCompleted ?? 0).toLocaleString()}
                    </div>
                    <div className="stat-desc">passed Guru+</div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-figure text-secondary text-xl">漢</div>
                    <div className="stat-title">Kanji</div>
                    <div className="stat-value text-secondary">
                      {(progress.kanjiCompleted ?? 0).toLocaleString()}
                    </div>
                    <div className="stat-desc">passed Guru+</div>
                  </div>
                  <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-figure text-accent text-xl">語</div>
                    <div className="stat-title">Vocabulary</div>
                    <div className="stat-value text-accent">
                      {(progress.vocabCompleted ?? 0).toLocaleString()}
                    </div>
                    <div className="stat-desc">passed Guru+</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Completion Estimator */}
            <div className="card bg-base-200 shadow-xl mb-8">
              <div className="card-body">
                <h2 className="card-title">Completion Estimator</h2>
                <p className="text-sm text-base-content/70">
                  WaniKani has {TOTAL_WK_ITEMS.toLocaleString()} total items. Estimate how long it will take
                  to start all lessons at your chosen pace.
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
                <div className="mt-4 text-sm space-y-1">
                  <p>Items started: {itemsStarted.toLocaleString()} / {TOTAL_WK_ITEMS.toLocaleString()}</p>
                  <p>Items remaining: {itemsRemaining.toLocaleString()}</p>
                  <p>
                    Estimated time to start all lessons:{' '}
                    <span className="font-semibold">
                      {estimatedDays?.toFixed(1)} days
                    </span>{' '}
                    ({estimatedWeeks?.toFixed(1)} weeks, {estimatedMonths?.toFixed(1)} months)
                  </p>
                </div>
              </div>
            </div>

            {/* Level History */}
            {levelProgressions.length > 0 && (
              <div className="card bg-base-200 shadow-xl mb-8">
                <div className="card-body">
                  <h2 className="card-title mb-4">Level History</h2>
                  <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="table table-compact w-full">
                      <thead className="sticky top-0 bg-base-200">
                        <tr>
                          <th>Level</th>
                          <th>Unlocked</th>
                          <th>Passed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...levelProgressions].reverse().map((lp, i) => {
                          const d = lp?.data ?? {};
                          const unlockedAt = d.unlocked_at
                            ? new Date(d.unlocked_at).toLocaleDateString()
                            : '—';
                          const passedAt = d.passed_at
                            ? new Date(d.passed_at).toLocaleDateString()
                            : null;
                          return (
                            <tr key={i}>
                              <td>
                                <span className="badge badge-primary">Level {d.level}</span>
                              </td>
                              <td>{unlockedAt}</td>
                              <td>
                                <span className={passedAt ? 'text-success' : 'text-warning'}>
                                  {passedAt ?? 'In progress'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Vocabulary List */}
            <div className="card bg-base-200 shadow-xl mb-8">
              <div className="card-body">
                <h2 className="card-title mb-4">Vocabulary ({vocabulary.length})</h2>
                {vocabulary.length > 0 ? (
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="table table-compact w-full">
                      <thead className="sticky top-0 bg-base-200">
                        <tr>
                          <th>Word</th>
                          <th>Reading</th>
                          <th>Meaning</th>
                          <th>SRS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vocabulary.map((item) => {
                          const { label, color } = srsLabel(item.srsStage);
                          return (
                            <tr key={item.id}>
                              <td className="text-xl font-bold">{item.characters}</td>
                              <td className="text-base-content/70">{item.reading ?? '—'}</td>
                              <td>{item.meaning ?? '—'}</td>
                              <td>
                                <span
                                  className="badge text-white text-xs"
                                  style={{ backgroundColor: color }}
                                >
                                  {label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-base-content/60">
                    No vocabulary yet. Sync WaniKani to load your started items.
                  </p>
                )}
              </div>
            </div>

            {/* Last Sync */}
            <div className="mt-4 text-sm text-base-content/60 text-center">
              Last synced:{' '}
              {progress.snapshotTime
                ? new Date(progress.snapshotTime).toLocaleString()
                : 'Never'}
            </div>
          </>
        ) : (
          <div className="alert alert-warning">
            <span>
              No data found. Add your WaniKani API key in{' '}
              <Link href="/settings" className="link">
                Settings
              </Link>
              , then click &quot;Sync WaniKani&quot; above.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
