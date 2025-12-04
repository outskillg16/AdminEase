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
    <div className="bg-white rounded-xl shadow-md p-4 h-full flex flex-col">
      <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
        <BarChart3 className="w-4 h-4 text-cyan-600 mr-2" />
        Weekly Summary
      </h2>

      <div className="space-y-1 flex-1">
        <div className="flex items-center justify-between py-0.5">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-700 font-medium">Total</span>
          </div>
          <span className="text-lg font-bold text-blue-600">{stats.total}</span>
        </div>

        <div className="flex items-center justify-between py-0.5">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
            </div>
            <span className="text-sm text-gray-700">Completed</span>
          </div>
          <span className="text-base font-semibold text-green-600">{stats.completed}</span>
        </div>

        <div className="flex items-center justify-between py-0.5">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-700">Upcoming</span>
          </div>
          <span className="text-base font-semibold text-orange-600">{stats.upcoming}</span>
        </div>

        <div className="flex items-center justify-between py-0.5">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-3.5 h-3.5 text-red-600" />
            </div>
            <span className="text-sm text-gray-700">Cancelled</span>
          </div>
          <span className="text-base font-semibold text-red-600">{stats.cancelled}</span>
        </div>

        <div className="flex items-center justify-between py-0.5">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-700">Rescheduled</span>
          </div>
          <span className="text-base font-semibold text-purple-600">{stats.rescheduled}</span>
        </div>
      </div>

      <div className="mt-auto pt-3">
        <button
          onClick={onNewAppointment}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </button>
      </div>
    </div>
  );
}
