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
      // Format date without timezone conversion
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: `${year}-${month}-${day}`,
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
    if (count === 1) return { bg: '#E8E8E8', label: 'LIGHT' };
    if (count <= 3) return { bg: '#BDBDBD', label: 'MODERATE' };
    return { bg: '#757575', label: 'BUSY' };
  };

  const calculateBarPosition = (appointments: Appointment[]) => {
    if (appointments.length === 0) return null;

    const earliestTime = Math.min(
      ...appointments.map((apt) => {
        const [hours, minutes] = apt.appointment_time.split(':').map(Number);
        return hours * 60 + minutes;
      })
    );

    const latestTime = Math.max(
      ...appointments.map((apt) => {
        const [hours, minutes] = apt.appointment_time.split(':').map(Number);
        return hours * 60 + minutes + apt.duration_minutes;
      })
    );

    const startHour = 8;
    const endHour = 17;
    const totalMinutes = (endHour - startHour) * 60;

    const left = ((earliestTime - startHour * 60) / totalMinutes) * 100;
    const width = ((latestTime - earliestTime) / totalMinutes) * 100;

    return {
      left: Math.max(0, Math.min(left, 100)),
      width: Math.max(5, Math.min(width, 100 - left)),
    };
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
    <div className="bg-white rounded-xl shadow-md p-6 h-full flex flex-col">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <span className="text-2xl mr-2">📊</span>
        Your Week at a Glance
      </h2>

      <div className="space-y-3 flex-1">
        {weekDays.map((day) => {
          const dayAppointments = appointmentsByDay[day.date] || [];
          const count = dayAppointments.length;
          const barStyle = getBarStyle(count);
          const barPosition = calculateBarPosition(dayAppointments);

          return (
            <div key={day.date} className="flex items-center space-x-4">
              <div className="w-20 text-left">
                <div className="font-semibold text-gray-900 text-sm">{day.name}</div>
                <div className="text-xs text-gray-500">
                  {count} event{count !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="flex-1 relative h-10 border-t border-b border-gray-200">
                <div className="absolute left-0 top-0 bottom-0 flex items-center">
                  <span className="text-xs text-gray-500 -ml-3">8AM</span>
                </div>
                <div className="absolute left-1/2 top-0 bottom-0 flex items-center -translate-x-1/2">
                  <span className="text-xs text-gray-500">12PM</span>
                </div>
                <div className="absolute right-0 top-0 bottom-0 flex items-center">
                  <span className="text-xs text-gray-500 -mr-3">5PM</span>
                </div>

                {barStyle && barPosition && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-6 rounded transition-all duration-200 cursor-pointer hover:opacity-80"
                    style={{
                      backgroundColor: barStyle.bg,
                      left: `${barPosition.left}%`,
                      width: `${barPosition.width}%`,
                    }}
                    onMouseEnter={(e) => handleMouseEnter(day.date, e)}
                    onMouseLeave={handleMouseLeave}
                  />
                )}
              </div>

              <div className="w-24 text-center">
                {barStyle ? (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                    {barStyle.label}
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-300">
                    EMPTY
                  </span>
                )}
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
