import { Bell } from 'lucide-react';

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (diffMins < 2880) return 'Yesterday';
    const days = Math.floor(diffMins / 1440);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const truncateDescription = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <Bell className="w-5 h-5 text-cyan-600 mr-2" />
        Recent Activity
      </h2>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm mb-1">{activity.type}</p>
                <p className="text-sm text-gray-600 leading-relaxed mb-1">
                  {truncateDescription(activity.description)}
                </p>
                <p className="text-xs text-gray-400">{getRelativeTime(activity.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
