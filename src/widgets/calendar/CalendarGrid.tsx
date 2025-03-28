import { useMemo, useState } from 'react';
import { TimeSlotElement } from '../../shared/ui/TimeSlotElement';
import { CELL_SIZE } from '../../shared/lib/constants';
import { Employee, TimeSlot } from '../../shared/lib/types';

type CalendarGridProps = {
  employees: Employee[];
  timeSlots: TimeSlot[];
  dates: Date[];
  onCellMouseDown: (employeeId: string, dateIndex: number) => void;
  onCellMouseUp: () => void;
  onCellMouseOver: (employeeId: string, dateIndex: number) => void;
  selectedCells: { employeeId: string; dateIndexes: number[] } | null;
};

export const CalendarGrid = ({
  employees,
  timeSlots,
  dates,
  onCellMouseDown,
  onCellMouseUp,
  onCellMouseOver,
  selectedCells
}: CalendarGridProps) => {
  // Группируем временные отрезки по сотрудникам для более быстрого доступа
  const timeSlotsByEmployee = useMemo(() => {
    const result: Record<string, TimeSlot[]> = {};
    
    for (const timeSlot of timeSlots) {
      if (!result[timeSlot.employeeId]) {
        result[timeSlot.employeeId] = [];
      }
      result[timeSlot.employeeId].push(timeSlot);
    }
    
    return result;
  }, [timeSlots]);

  // Проверяем, попадает ли ячейка в выделенный диапазон
  const isCellSelected = (employeeId: string, dateIndex: number) => {
    if (!selectedCells) return false;
    
    return (
      selectedCells.employeeId === employeeId &&
      selectedCells.dateIndexes.includes(dateIndex)
    );
  };

  // Рассчитываем общую ширину сетки
  const gridWidth = dates.length * CELL_SIZE;

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        width: gridWidth,
        minWidth: gridWidth
      }}
    >
      {employees.map(employee => (
        <div 
          key={employee.id} 
          style={{ 
            position: 'relative', 
            height: CELL_SIZE,
            width: gridWidth,
            minWidth: gridWidth
          }}
        >
          {/* Строка ячеек для сотрудника */}
          <div 
            style={{ 
              display: 'flex', 
              position: 'relative', 
              height: CELL_SIZE,
              width: gridWidth,
              minWidth: gridWidth
            }}
          >
            {dates.map((date, dateIndex) => {
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const isSelected = isCellSelected(employee.id, dateIndex);
              
              return (
                <div
                  key={dateIndex}
                  style={{
                    width: CELL_SIZE,
                    minWidth: CELL_SIZE,
                    maxWidth: CELL_SIZE,
                    height: CELL_SIZE,
                    border: '1px solid #e5e5e5',
                    boxSizing: 'border-box',
                    backgroundColor: isSelected
                      ? 'rgba(24, 144, 255, 0.3)'
                      : isWeekend
                      ? '#f9f9f9'
                      : '#ffffff',
                    cursor: 'pointer',
                    flex: '0 0 auto'
                  }}
                  onMouseDown={() => onCellMouseDown(employee.id, dateIndex)}
                  onMouseUp={onCellMouseUp}
                  onMouseOver={() => onCellMouseOver(employee.id, dateIndex)}
                />
              );
            })}
          </div>
          
          {/* Временные отрезки для сотрудника */}
          {timeSlotsByEmployee[employee.id]?.map(timeSlot => {
            const startDate = new Date(timeSlot.startDate);
            const endDate = new Date(timeSlot.endDate);
            
            const startIndex = dates.findIndex(
              date => date.toDateString() === startDate.toDateString()
            );
            
            if (startIndex === -1) return null;
            
            const endIndex = dates.findIndex(
              date => date.toDateString() === endDate.toDateString()
            );
            
            if (endIndex === -1) return null;
            
            const width = endIndex - startIndex + 1;
            
            return (
              <div 
                key={timeSlot.id}
                style={{
                  position: 'absolute',
                  left: startIndex * CELL_SIZE,
                  top: 0,
                  height: CELL_SIZE,
                  zIndex: 10
                }}
              >
                <TimeSlotElement
                  projectName={timeSlot.projectName}
                  status={timeSlot.status}
                  width={width}
                  onClick={() => {}}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}; 