import { CheckCircle, Calendar, XCircle, RefreshCw, BarChart3, Plus } from 'lucide-react';

interface WeeklyStats {
  total: number;
  completed: number;
  upcoming: number;
  cancelled: number;
  rescheduled: number;
}

interface WeeklySummaryProps {
  stats: WeeklyStats;
  onNewAppointment: () => void;
}

export default function WeeklySummary({ stats, onNewAppointment }: WeeklySummaryProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 h-full flex flex-col">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <BarChart3 className="w-5 h-5 text-cyan-600 mr-2" />
        Weekly Summary
      </h2>

      <div className="space-y-3 flex-1">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-gray-700 font-medium">Total</span>
          </div>
          <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-gray-700">Completed</span>
          </div>
          <span className="text-xl font-semibold text-green-600">{stats.completed}</span>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-gray-700">Upcoming</span>
          </div>
          <span className="text-xl font-semibold text-orange-600">{stats.upcoming}</span>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-gray-700">Cancelled</span>
          </div>
          <span className="text-xl font-semibold text-red-600">{stats.cancelled}</span>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-gray-700">Rescheduled</span>
          </div>
          <span className="text-xl font-semibold text-purple-600">{stats.rescheduled}</span>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <button
          onClick={onNewAppointment}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>New Appointment</span>
        </button>
      </div>
    </div>
  );
}
