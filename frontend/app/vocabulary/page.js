'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const USER_ID = '1';

const SOURCE_CONFIG = {
  both:     { label: 'Both Apps',      color: '#a855f7', badgeClass: '' },
  wanikani: { label: 'WaniKani Only',  color: '#f100a1', badgeClass: '' },
  duolingo: { label: 'Duolingo Only',  color: '#65c3c8', badgeClass: '' },
};

const FILTERS = ['all', 'both', 'wanikani', 'duolingo'];
const FILTER_LABELS = {
  all:      'All',
  both:     'Both Apps',
  wanikani: 'WaniKani Only',
  duolingo: 'Duolingo Only',
};

export default function VocabularyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetch(`${API_BASE}/api/vocabulary/dashboard/${USER_ID}`)
      .then((res) => res.ok ? res.json() : Promise.reject('Failed to load'))
      .then(setData)
      .catch(() => setError('Could not load vocabulary data. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  const summary = data?.summary ?? {};
  const vocabulary = data?.vocabulary ?? [];

  const total     = summary.totalUnique ?? 0;
  const both      = summary.both        ?? 0;
  const duoOnly   = summary.duolingoOnly  ?? 0;
  const wkOnly    = summary.waniKaniOnly  ?? 0;

  const duoPct  = total > 0 ? (duoOnly / total) * 100 : 0;
  const bothPct = total > 0 ? (both    / total) * 100 : 0;
  const wkPct   = total > 0 ? (wkOnly  / total) * 100 : 0;

  const wkCoverageOfDuo = (both + wkOnly) > 0 && both > 0
    ? Math.round((both / (both + wkOnly)) * 100)
    : 0;
  const duoCoverageOfWk = (both + duoOnly) > 0 && both > 0
    ? Math.round((both / (both + duoOnly)) * 100)
    : 0;

  const filtered = activeFilter === 'all'
    ? vocabulary
    : vocabulary.filter((v) => v.source === activeFilter);

  return (
    <div className="min-h-screen bg-base-100">
      <div className="navbar bg-primary text-primary-content shadow-lg">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost normal-case text-xl">
            Japanese Learning Hub
          </Link>
        </div>
        <div className="flex-none gap-2">
          <Link href="/apps" className="btn btn-ghost">Apps</Link>
          <Link href="/settings" className="btn btn-ghost">Settings</Link>
        </div>
      </div>

      <div className="p-4 max-w-5xl mx-auto py-12">
        <h1 className="text-4xl font-bold mb-2">📊 Vocabulary Dashboard</h1>
        <p className="text-lg text-base-content/70 mb-8">
          Cross-referenced vocabulary across Duolingo and WaniKani
        </p>

        {error && (
          <div className="alert alert-error mb-6"><span>{error}</span></div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : data ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="stat bg-base-200 rounded-lg shadow">
                <div className="stat-title">Total Unique Words</div>
                <div className="stat-value">{total.toLocaleString()}</div>
                <div className="stat-desc">across both apps</div>
              </div>
              <div className="stat rounded-lg shadow text-white" style={{ backgroundColor: '#a855f7' }}>
                <div className="stat-title text-white/80">In Both Apps</div>
                <div className="stat-value text-white">{both.toLocaleString()}</div>
                <div className="stat-desc text-white/70">reinforced words</div>
              </div>
              <div className="stat rounded-lg shadow text-white" style={{ backgroundColor: '#65c3c8' }}>
                <div className="stat-title text-white/80">Duolingo Only</div>
                <div className="stat-value text-white">{duoOnly.toLocaleString()}</div>
                <div className="stat-desc text-white/70">unique to Duolingo</div>
              </div>
              <div className="stat rounded-lg shadow text-white" style={{ backgroundColor: '#f100a1' }}>
                <div className="stat-title text-white/80">WaniKani Only</div>
                <div className="stat-value text-white">{wkOnly.toLocaleString()}</div>
                <div className="stat-desc text-white/70">unique to WaniKani</div>
              </div>
            </div>

            {/* Overlap Bar */}
            {total > 0 && (
              <div className="card bg-base-200 shadow-xl mb-8">
                <div className="card-body">
                  <h2 className="card-title mb-4">Vocabulary Overlap</h2>
                  <div className="flex w-full h-10 rounded-lg overflow-hidden mb-3">
                    {duoOnly > 0 && (
                      <div
                        style={{ width: `${duoPct}%`, backgroundColor: '#65c3c8' }}
                        title={`Duolingo Only: ${duoOnly}`}
                      />
                    )}
                    {both > 0 && (
                      <div
                        style={{ width: `${bothPct}%`, backgroundColor: '#a855f7' }}
                        title={`Both: ${both}`}
                      />
                    )}
                    {wkOnly > 0 && (
                      <div
                        style={{ width: `${wkPct}%`, backgroundColor: '#f100a1' }}
                        title={`WaniKani Only: ${wkOnly}`}
                      />
                    )}
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#65c3c8' }}></div>
                      <span>Duolingo Only ({duoOnly} · {duoPct.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#a855f7' }}></div>
                      <span>Both Apps ({both} · {bothPct.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f100a1' }}></div>
                      <span>WaniKani Only ({wkOnly} · {wkPct.toFixed(1)}%)</span>
                    </div>
                  </div>
                  {/* Cross-app insights */}
                  {both > 0 && (
                    <div className="mt-4 space-y-1 text-sm text-base-content/70">
                      <p>
                        <span className="font-semibold">{wkCoverageOfDuo}%</span> of your WaniKani vocabulary
                        is also covered in Duolingo.
                      </p>
                      <p>
                        <span className="font-semibold">{duoCoverageOfWk}%</span> of your Duolingo vocabulary
                        has a WaniKani counterpart.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Filter Tabs + Table */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="flex flex-wrap gap-2 mb-4">
                  {FILTERS.map((f) => {
                    const count = f === 'all' ? total
                      : f === 'both'     ? both
                      : f === 'duolingo' ? duoOnly
                      : wkOnly;
                    return (
                      <button
                        key={f}
                        className={`btn btn-sm ${activeFilter === f ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveFilter(f)}
                      >
                        {FILTER_LABELS[f]}
                        <span className="ml-1 opacity-70">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {filtered.length > 0 ? (
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="table table-compact w-full">
                      <thead className="sticky top-0 bg-base-200">
                        <tr>
                          <th>Japanese</th>
                          <th>Reading</th>
                          <th>Meaning</th>
                          <th>Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((item, i) => {
                          const { label, color } = SOURCE_CONFIG[item.source] ?? SOURCE_CONFIG.duolingo;
                          return (
                            <tr key={i}>
                              <td className="text-xl font-bold">{item.japanese ?? '—'}</td>
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
                  <p className="text-center text-base-content/60 py-8">
                    No vocabulary found for this filter.{' '}
                    {total === 0 && (
                      <>
                        Import words from{' '}
                        <Link href="/apps/duolingo/1" className="link">Duolingo</Link> or sync{' '}
                        <Link href="/apps/wanikani/1" className="link">WaniKani</Link> first.
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="alert alert-warning">
            <span>
              No vocabulary data yet. Import words from{' '}
              <Link href="/apps/duolingo/1" className="link">Duolingo</Link> or sync{' '}
              <Link href="/apps/wanikani/1" className="link">WaniKani</Link> first.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
