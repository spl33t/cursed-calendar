import { CELL_SIZE } from '../../shared/lib/constants';
import { getWeekNumber } from '../../shared/lib/dateUtils';

type CalendarHeaderProps = {
  dates: Date[];
};

export const CalendarHeader = ({ dates }: CalendarHeaderProps) => {
  // Функция для определения месяца и его диапазона дат
  const getMonthRanges = () => {
    const ranges: { month: string; startIndex: number; endIndex: number }[] = [];
    
    dates.forEach((date, index) => {
      const monthName = date.toLocaleDateString('ru-RU', { month: 'long' });
      
      const lastRange = ranges[ranges.length - 1];
      
      if (!lastRange || lastRange.month !== monthName) {
        ranges.push({
          month: monthName,
          startIndex: index,
          endIndex: index
        });
      } else {
        lastRange.endIndex = index;
      }
    });
    
    return ranges;
  };

  // Функция для определения недели
  const getWeeks = () => {
    const weeks: { weekNumber: number; startIndex: number; endIndex: number }[] = [];
    
    dates.forEach((date, index) => {
      // Получаем номер недели
      const weekNumber = getWeekNumber(date);
      
      const lastWeek = weeks[weeks.length - 1];
      
      if (!lastWeek || lastWeek.weekNumber !== weekNumber) {
        weeks.push({
          weekNumber,
          startIndex: index,
          endIndex: index
        });
      } else {
        lastWeek.endIndex = index;
      }
    });
    
    return weeks;
  };

  const monthRanges = getMonthRanges();
  const weeks = getWeeks();
  
  // Рассчитываем общую ширину хедера
  const headerWidth = dates.length * CELL_SIZE;

  return (
    <div style={{ width: headerWidth, minWidth: headerWidth }}>
      {/* Заголовки месяцев */}
      <div style={{ 
        display: 'flex', 
        height: CELL_SIZE, 
        position: 'relative', 
        width: headerWidth, 
        minWidth: headerWidth 
      }}>
        {monthRanges.map(({ month, startIndex, endIndex }) => (
          <div
            key={`month-${startIndex}`}
            style={{
              position: 'absolute',
              left: startIndex * CELL_SIZE,
              width: (endIndex - startIndex + 1) * CELL_SIZE,
              minWidth: (endIndex - startIndex + 1) * CELL_SIZE,
              height: CELL_SIZE,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#f0f0f0',
              borderTop: '1px solid #e5e5e5',
              borderLeft: startIndex > 0 ? '1px solid #e5e5e5' : 'none',
              borderRight: '1px solid #e5e5e5',
              boxSizing: 'border-box',
              fontSize: '12px',
              overflow: 'hidden',
              textTransform: 'capitalize'
            }}
          >
            {month}
          </div>
        ))}
      </div>

      {/* Заголовки недель */}
      <div style={{ 
        display: 'flex', 
        height: CELL_SIZE, 
        position: 'relative', 
        width: headerWidth, 
        minWidth: headerWidth 
      }}>
        {weeks.map(({ weekNumber, startIndex, endIndex }) => (
          <div
            key={`week-${startIndex}`}
            style={{
              position: 'absolute',
              left: startIndex * CELL_SIZE,
              width: (endIndex - startIndex + 1) * CELL_SIZE,
              minWidth: (endIndex - startIndex + 1) * CELL_SIZE,
              height: CELL_SIZE,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#f5f5f5',
              borderLeft: startIndex > 0 ? '1px solid #e5e5e5' : 'none',
              borderRight: '1px solid #e5e5e5',
              borderBottom: '1px solid #e5e5e5',
              boxSizing: 'border-box',
              fontSize: '12px'
            }}
          >
            Неделя {weekNumber}
          </div>
        ))}
      </div>

      {/* Заголовки дней */}
      <div style={{ 
        display: 'flex', 
        height: CELL_SIZE, 
        width: headerWidth, 
        minWidth: headerWidth 
      }}>
        {dates.map((date, index) => {
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const dayOfMonth = date.getDate();
          const dayOfWeek = date.toLocaleDateString('ru-RU', { weekday: 'short' });
          
          return (
            <div
              key={index}
              style={{
                width: CELL_SIZE,
                minWidth: CELL_SIZE,
                maxWidth: CELL_SIZE,
                height: CELL_SIZE,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: isWeekend ? '#f9f9f9' : '#ffffff',
                borderLeft: index > 0 ? '1px solid #e5e5e5' : 'none',
                borderRight: '1px solid #e5e5e5',
                borderBottom: '1px solid #e5e5e5',
                boxSizing: 'border-box',
                fontSize: '12px',
                flex: '0 0 auto'
              }}
            >
              <div>{dayOfMonth}</div>
              <div style={{ fontSize: '10px' }}>{dayOfWeek}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 