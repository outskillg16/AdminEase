import { useState, useMemo } from 'react';

interface Appointment {
  id: string;
  first_name: string;
  last_name: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  service_type: string;
}

interface WeekAtGlanceProps {
  appointments: Appointment[];
}

interface TooltipState {
  day: string;
  x: number;
  y: number;
}

export default function WeekAtGlance({ appointments }: WeekAtGlanceProps) {
  const [hoveredDay, setHoveredDay] = useState<TooltipState | null>(null);

  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toISOString().split('T')[0],
        fullName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      };
    });
  }, []);

  const appointmentsByDay = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    weekDays.forEach((day) => {
      grouped[day.date] = appointments.filter((apt) => apt.appointment_date.startsWith(day.date));
    });
    return grouped;
  }, [appointments, weekDays]);

  const getBarStyle = (count: number) => {
    if (count === 0) return null;
    if (count === 1) return { bg: '#E8E8E8', label: 'LIGHT', height: 40 };
    if (count <= 3) return { bg: '#BDBDBD', label: 'MODERATE', height: 60 };
    return { bg: '#757575', label: 'BUSY', height: 80 };
  };

  const formatTime = (timeStr: string, durationMins: number) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0);
    const end = new Date(start.getTime() + durationMins * 60000);

    const format = (date: Date) => {
      const h = date.getHours();
      const m = date.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour = h % 12 || 12;
      return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    return { start: format(start), end: format(end) };
  };

  const handleMouseEnter = (day: string, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredDay({
      day,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="text-2xl mr-2">📊</span>
        Your Week at a Glance
      </h2>

      <div className="grid grid-cols-5 gap-4">
        {weekDays.map((day) => {
          const dayAppointments = appointmentsByDay[day.date] || [];
          const count = dayAppointments.length;
          const barStyle = getBarStyle(count);

          return (
            <div key={day.date} className="text-center">
              <div className="font-semibold text-gray-700 mb-2">{day.name}</div>
              <div className="text-xs text-gray-500 mb-1">8AM</div>

              <div className="h-32 flex items-center justify-center relative">
                {barStyle && (
                  <div
                    className="w-full rounded transition-all duration-200 cursor-pointer hover:opacity-80 hover:scale-105"
                    style={{
                      backgroundColor: barStyle.bg,
                      height: `${barStyle.height}px`,
                    }}
                    onMouseEnter={(e) => handleMouseEnter(day.date, e)}
                    onMouseLeave={handleMouseLeave}
                  />
                )}
              </div>

              <div className="text-xs text-gray-500 my-1">12PM</div>
              <div className="text-xs text-gray-500 mb-2">5PM</div>

              {barStyle && (
                <div className="text-xs font-semibold text-gray-600 tracking-wide mb-1">
                  {barStyle.label}
                </div>
              )}

              <div className="text-xs text-gray-500">
                {count} event{count !== 1 ? 's' : ''}
              </div>
            </div>
          );
        })}
      </div>

      {hoveredDay && appointmentsByDay[hoveredDay.day]?.length > 0 && (
        <div
          className="fixed z-50 bg-gray-900 bg-opacity-95 text-white rounded-lg shadow-2xl p-4 max-w-xs"
          style={{
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y - 10}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {appointmentsByDay[hoveredDay.day].map((apt, idx) => {
            const times = formatTime(apt.appointment_time, apt.duration_minutes);
            return (
              <div key={idx} className={`${idx > 0 ? 'mt-3 pt-3 border-t border-gray-700' : ''}`}>
                <div className="font-semibold">
                  {apt.first_name} {apt.last_name}
                </div>
                <div className="text-sm text-gray-300">
                  {times.start} - {times.end}
                </div>
                <div className="text-sm text-gray-400">Duration: {apt.duration_minutes} minutes</div>
              </div>
            );
          })}
          <div
            className="absolute w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900"
            style={{
              left: '50%',
              bottom: '-8px',
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      )}
    </div>
  );
}
