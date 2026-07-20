'use client';

import Link from 'next/link';

export default function Apps() {
  const userId = '1'; // For now, hardcode to 1 (single user)
  
  const apps = [
    {
      name: 'Duolingo',
      description: 'Track your Duolingo lessons and vocabulary progress',
      icon: '🌲',
      href: `/apps/duolingo/${userId}`,
      status: 'Connected',
    },
    {
      name: 'WaniKani',
      description: 'Track your kanji and vocabulary SRS progress',
      icon: '🦀',
      href: `/apps/wanikani/${userId}`,
      status: 'Active',
      disabled: false,
    },
  ];

  return (
    <div className="min-h-screen bg-base-100">
      <div className="navbar bg-primary text-primary-content shadow-lg">
        <div className="flex-1">
          <a href="/" className="btn btn-ghost normal-case text-xl">
            Japanese Learning Hub
          </a>
        </div>
        <div className="flex-none">
          <Link href="/settings" className="btn btn-ghost">
            Settings
          </Link>
        </div>
      </div>

      <div className="p-4 max-w-5xl mx-auto py-12">
        <h1 className="text-3xl font-bold mb-2">Learning Apps</h1>
        <p className="text-lg text-base-content/70 mb-8">
          Select an app to view your progress and vocabulary
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apps.map((app) => (
            <div key={app.name} className={`card bg-base-200 shadow-xl ${app.disabled ? 'opacity-50' : ''}`}>
              <div className="card-body">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="card-title text-3xl">{app.icon}</h2>
                  <span className={`badge ${app.status === 'Connected' ? 'badge-success' : 'badge-warning'}`}>
                    {app.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{app.name}</h3>
                <p className="text-sm">{app.description}</p>
                <div className="card-actions justify-end mt-4">
                  {app.disabled ? (
                    <button className="btn btn-primary btn-disabled">Coming Soon</button>
                  ) : (
                    <Link href={app.href} className="btn btn-primary">
                      View Progress
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
