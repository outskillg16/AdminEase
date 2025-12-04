import { Calendar, ChevronRight } from 'lucide-react';

interface Appointment {
  id: string;
  first_name: string;
  last_name: string;
  appointment_date: string;
  appointment_time: string;
}

interface UpcomingWeekProps {
  appointments: Appointment[];
  onViewAll: () => void;
}

export default function UpcomingWeek({ appointments, onViewAll }: UpcomingWeekProps) {
  const formatDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour = hours % 12 || 12;
    const time = `${hour}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    return { monthDay, time };
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <span className="text-2xl mr-2">📆</span>
          Upcoming This Week
        </h2>
        <button
          onClick={onViewAll}
          className="text-cyan-600 hover:text-cyan-700 font-medium text-sm flex items-center space-x-1 transition"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No upcoming appointments this week</p>
            <p className="text-gray-400 text-xs mt-1">All appointments are completed or in the past</p>
          </div>
        ) : (
          appointments.map((apt) => {
            const { monthDay, time } = formatDateTime(apt.appointment_date, apt.appointment_time);
            return (
              <div
                key={apt.id}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition cursor-pointer"
              >
                <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {apt.first_name} {apt.last_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {monthDay}, {time}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
