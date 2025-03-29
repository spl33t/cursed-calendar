import { useMemo } from 'react';
import { CalendarWidget } from '../../widgets/calendar/CalendarWidget';
import { generateEmployees, generateTimeSlots } from '../../shared/lib/mockDataGenerator';

export const CalendarPage = () => {
  // Генерируем тестовые данные для передачи в Calendar
  const employees = useMemo(() => generateEmployees(100), []);
  const initialStartDate = useMemo(() => new Date('2024-03-01'), []);
  const initialEndDate = useMemo(() => new Date('2024-03-31'), []);
  const timeSlots = useMemo(() => 
    generateTimeSlots(employees, initialStartDate, initialEndDate, 0.3),
  [employees, initialStartDate, initialEndDate]);

  return (
    <div style={{ height: '100vh', fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif' }}>
      <CalendarWidget 
        employees={employees}
        initialTimeSlots={timeSlots}
        initialStartDate={initialStartDate}
        initialEndDate={initialEndDate}
      />
    </div>
  );
};

export default CalendarPage; 