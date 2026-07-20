import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Navbar */}
      <div className="navbar bg-primary text-primary-content shadow-lg">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl">Japanese Learning Hub</a>
        </div>
        <div className="flex-none">
          <Link href="/settings" className="btn btn-ghost">
            Settings
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 max-w-5xl mx-auto py-12">
        <h1 className="text-4xl font-bold mb-4">Welcome</h1>
        <p className="text-lg mb-8">Track your Japanese learning progress across multiple apps and plan your learning journey.</p>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl">0</h2>
              <p>Apps Connected</p>
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl">0</h2>
              <p>Vocabulary Learned</p>
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl">0%</h2>
              <p>Overall Progress</p>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">🌲 Get Started</h2>
              <p>Connect your Duolingo account to start tracking your progress.</p>
              <div className="card-actions justify-end">
                <Link href="/apps" className="btn btn-primary">
                  Go to Apps
                </Link>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">⚙️ Settings</h2>
              <p>Add your learning app tokens and manage your integrations.</p>
              <div className="card-actions justify-end">
                <Link href="/settings" className="btn btn-primary">
                  Go to Settings
                </Link>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">📊 Vocabulary Dashboard</h2>
              <p>Visualize overlaps and track words across all your apps.</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-disabled">Coming Soon</button>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">📅 Timeline View</h2>
              <p>See your 10-year learning journey at a glance.</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-disabled">Coming Soon</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
