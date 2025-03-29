import React, { memo, useCallback } from 'react';
import { Employee } from '../../shared/lib/types';
import { SIDEBAR_WIDTH } from '../../shared/lib/constants';
import { VirtualItem } from '@tanstack/react-virtual';

type EmployeeSidebarProps = {
  employees: Employee[];
  selectedEmployee: string | null;
  onSelectEmployee: (id: string) => void;
  virtualRows: VirtualItem[];
  parentRef: React.RefObject<HTMLDivElement | null>;
  totalHeight: number;
};

// Выносим отдельно строку сотрудника для оптимизации
const EmployeeRow = memo(({
  employee,
  isSelected,
  onSelect,
  virtualRow
}: {
  employee: Employee;
  isSelected: boolean;
  onSelect: (id: string) => void;
  virtualRow: VirtualItem;
}) => {
  // Мемоизируем обработчик клика для предотвращения лишних ререндеров
  const handleClick = useCallback(() => {
    onSelect(employee.id);
  }, [employee.id, onSelect]);
  
  return (
    <div
      onClick={handleClick}
      style={{
        padding: '10px 15px',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
        borderBottom: '1px solid #f0f0f0',
        fontWeight: isSelected ? 'bold' : 'normal',
        height: 30,
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        transform: `translateY(${virtualRow.start}px)`
      }}
    >
      {employee.name}
    </div>
  );
}, (prevProps, nextProps) => {
  // Оптимизированное сравнение для уменьшения ререндеров
  return (
    prevProps.employee.id === nextProps.employee.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.virtualRow.index === nextProps.virtualRow.index
  );
});

export const EmployeeSidebar = memo(({
  employees,
  selectedEmployee,
  onSelectEmployee,
  virtualRows,
  parentRef,
  totalHeight
}: EmployeeSidebarProps) => {
  return (
    <div
      ref={parentRef}
      style={{
        minWidth: SIDEBAR_WIDTH,
        width: SIDEBAR_WIDTH,
        backgroundColor: '#f9f9f9',
        borderRight: '1px solid #e5e5e5',
        overflow: 'visible', // Позволяет скроллу родителя работать
        height: '100%'
      }}
    >
      <div 
        className="employee-list"
        style={{
          height: `${totalHeight}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualRows.map(virtualRow => {
          const employee = employees[virtualRow.index];
          return (
            <EmployeeRow
              key={virtualRow.key ?? employee.id}
              employee={employee}
              isSelected={selectedEmployee === employee.id}
              onSelect={onSelectEmployee}
              virtualRow={virtualRow}
            />
          );
        })}
      </div>
    </div>
  );
}); 