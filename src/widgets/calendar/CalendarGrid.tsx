import React, { useMemo, useState, memo, useCallback } from 'react';
import { TimeSlotElement } from '../../shared/ui/TimeSlotElement';
import { CELL_SIZE } from '../../shared/lib/constants';
import { Employee, TimeSlot } from '../../shared/lib/types';
import { VirtualItem } from '@tanstack/react-virtual';

type CalendarGridProps = {
  employees: Employee[];
  timeSlots: TimeSlot[];
  dates: Date[];
  onCellMouseDown: (employeeId: string, dateIndex: number) => void;
  onCellMouseUp: () => void;
  onCellMouseOver: (employeeId: string, dateIndex: number) => void;
  selectedCells: { employeeId: string; dateIndexes: number[] } | null;
  virtualRows: VirtualItem[];
  totalHeight: number;
};

// Оптимизированная ячейка календаря
const CalendarCell = memo(({
  dateIndex,
  isWeekend,
  isSelected,
  onMouseDown,
  onMouseUp,
  onMouseOver
}: {
  dateIndex: number;
  isWeekend: boolean;
  isSelected: boolean;
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseOver: () => void;
}) => (
  <div
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
    onMouseDown={onMouseDown}
    onMouseUp={onMouseUp}
    onMouseOver={onMouseOver}
  />
));

// Оптимизированный слот времени
const TimeSlotComponent = memo(({
  timeSlot,
  startIndex,
  dates,
  width
}: {
  timeSlot: TimeSlot;
  startIndex: number;
  dates: Date[];
  width: number;
}) => {
  return (
    <div 
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
});

// Выносим строку с ячейками в отдельный компонент для оптимизации
const EmployeeRow = memo(({
  employee,
  dates,
  timeSlots,
  timeSlotsByEmployee,
  onCellMouseDown,
  onCellMouseUp,
  onCellMouseOver,
  isCellSelected,
  virtualRow,
  gridWidth
}: {
  employee: Employee;
  dates: Date[];
  timeSlots: TimeSlot[];
  timeSlotsByEmployee: Record<string, TimeSlot[]>;
  onCellMouseDown: (employeeId: string, dateIndex: number) => void;
  onCellMouseUp: () => void;
  onCellMouseOver: (employeeId: string, dateIndex: number) => void;
  isCellSelected: (employeeId: string, dateIndex: number) => boolean;
  virtualRow: VirtualItem;
  gridWidth: number;
}) => {
  // Предварительно вычисляем слоты времени для текущего сотрудника
  const employeeTimeSlots = useMemo(() => {
    const slots = timeSlotsByEmployee[employee.id] || [];
    return slots.map(timeSlot => {
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
      
      return {
        timeSlot,
        startIndex,
        width,
        key: timeSlot.id
      };
    }).filter(Boolean);
  }, [timeSlotsByEmployee, employee.id, dates]);

  // Мемоизируем функции обработчиков для всей строки
  const handleCellMouseDown = useCallback((dateIndex: number) => {
    onCellMouseDown(employee.id, dateIndex);
  }, [employee.id, onCellMouseDown]);
  
  const handleCellMouseOver = useCallback((dateIndex: number) => {
    onCellMouseOver(employee.id, dateIndex);
  }, [employee.id, onCellMouseOver]);

  return (
    <div 
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        height: CELL_SIZE,
        width: gridWidth,
        minWidth: gridWidth,
        transform: `translateY(${virtualRow.start}px)`
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
            <CalendarCell
              key={dateIndex}
              dateIndex={dateIndex}
              isWeekend={isWeekend}
              isSelected={isSelected}
              onMouseDown={() => handleCellMouseDown(dateIndex)}
              onMouseUp={onCellMouseUp}
              onMouseOver={() => handleCellMouseOver(dateIndex)}
            />
          );
        })}
      </div>
      
      {/* Временные отрезки для сотрудника */}
      {employeeTimeSlots.map(slot => (
        slot && (
          <TimeSlotComponent
            key={slot.key}
            timeSlot={slot.timeSlot}
            startIndex={slot.startIndex}
            dates={dates}
            width={slot.width}
          />
        )
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // Оптимизированное сравнение пропсов
  return (
    prevProps.employee.id === nextProps.employee.id &&
    prevProps.virtualRow.index === nextProps.virtualRow.index &&
    prevProps.timeSlotsByEmployee[prevProps.employee.id] === nextProps.timeSlotsByEmployee[nextProps.employee.id] &&
    prevProps.isCellSelected === nextProps.isCellSelected
  );
});

export const CalendarGrid = ({
  employees,
  timeSlots,
  dates,
  onCellMouseDown,
  onCellMouseUp,
  onCellMouseOver,
  selectedCells,
  virtualRows,
  totalHeight
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
  const isCellSelected = useCallback((employeeId: string, dateIndex: number) => {
    if (!selectedCells) return false;
    
    return (
      selectedCells.employeeId === employeeId &&
      selectedCells.dateIndexes.includes(dateIndex)
    );
  }, [selectedCells]);

  // Рассчитываем общую ширину сетки
  const gridWidth = dates.length * CELL_SIZE;

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        width: gridWidth,
        minWidth: gridWidth,
        height: `${totalHeight}px`,
        position: 'relative'
      }}
    >
      {virtualRows.map(virtualRow => {
        const employee = employees[virtualRow.index];
        
        return (
          <EmployeeRow
            key={virtualRow.key}
            employee={employee}
            dates={dates}
            timeSlots={timeSlots}
            timeSlotsByEmployee={timeSlotsByEmployee}
            onCellMouseDown={onCellMouseDown}
            onCellMouseUp={onCellMouseUp}
            onCellMouseOver={onCellMouseOver}
            isCellSelected={isCellSelected}
            virtualRow={virtualRow}
            gridWidth={gridWidth}
          />
        );
      })}
    </div>
  );
}; 