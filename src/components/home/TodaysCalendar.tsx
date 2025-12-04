import { ChevronLeft, ChevronRight, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';

interface Appointment {
  id: string;
  first_name: string;
  last_name: string;
  appointment_time: string;
  customer_phone: string;
  service_type: string;
  status: string;
}

interface TodaysCalendarProps {
  appointments: Appointment[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onSync: () => void;
  onNavigateToCalendar: () => void;
}

export default function TodaysCalendar({
  appointments,
  selectedDate,
  onDateChange,
  onSync,
  onNavigateToCalendar,
}: TodaysCalendarProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour = hours % 12 || 12;
    return `${hour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'border-green-500 bg-green-50';
      case 'completed':
        return 'border-blue-500 bg-blue-50';
      case 'cancelled':
        return 'border-red-500 bg-red-50';
      case 'rescheduled':
        return 'border-purple-500 bg-purple-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'rescheduled':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <span className="text-2xl mr-2">📅</span>
          Today's Calendar
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-lg font-semibold text-gray-900 min-w-[280px] text-center">
            {formatDate(selectedDate)}
          </span>
          <button
            onClick={goToNextDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Next day"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onSync}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-50 text-cyan-600 hover:bg-cyan-100 rounded-lg transition font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Sync Calendar</span>
          </button>
          <button
            onClick={onNavigateToCalendar}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition font-medium"
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Full Calendar</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No appointments scheduled</h3>
            <p className="text-gray-500">No appointments for this day</p>
          </div>
        ) : (
          appointments.map((apt) => (
            <div
              key={apt.id}
              className={`border-l-4 rounded-lg p-4 transition-all hover:shadow-md cursor-pointer ${getStatusColor(
                apt.status
              )}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {apt.first_name} {apt.last_name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium uppercase mb-1">{apt.service_type}</p>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span>{formatTime(apt.appointment_time)}</span>
                    <span>•</span>
                    <span>{apt.customer_phone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
