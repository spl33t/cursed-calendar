import { Employee } from '../../shared/lib/types';
import { SIDEBAR_WIDTH } from '../../shared/lib/constants';

type EmployeeSidebarProps = {
  employees: Employee[];
  selectedEmployee: string | null;
  onSelectEmployee: (id: string) => void;
};

export const EmployeeSidebar = ({
  employees,
  selectedEmployee,
  onSelectEmployee
}: EmployeeSidebarProps) => {
  return (
    <div
      style={{
        minWidth: SIDEBAR_WIDTH,
        width: SIDEBAR_WIDTH,
        backgroundColor: '#f9f9f9',
        borderRight: '1px solid #e5e5e5',
        overflow: 'visible' // Позволяет скроллу родителя работать
      }}
    >
      <div className="employee-list">
        {employees.map(employee => (
          <div
            key={employee.id}
            onClick={() => onSelectEmployee(employee.id)}
            style={{
              padding: '10px 15px',
              cursor: 'pointer',
              backgroundColor: selectedEmployee === employee.id ? '#e6f7ff' : 'transparent',
              borderBottom: '1px solid #f0f0f0',
              fontWeight: selectedEmployee === employee.id ? 'bold' : 'normal',
              height: 30,
              display: 'flex',
              alignItems: 'center',
              boxSizing: 'border-box'
            }}
          >
            {employee.name}
          </div>
        ))}
      </div>
    </div>
  );
}; 