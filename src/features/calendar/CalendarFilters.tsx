import { DatePicker } from '../../shared/ui/DatePicker';
import { Select } from '../../shared/ui/Select';
import { SearchInput } from '../../shared/ui/SearchInput';
import { Button } from '../../shared/ui/Button';
import { CalendarFilter } from '../../shared/lib/types';
import { STATUS_COLORS } from '../../shared/lib/constants';

type CalendarFiltersProps = {
  filters: CalendarFilter;
  onFiltersChange: (filters: Partial<CalendarFilter>) => void;
  onReserve: () => void;
};

export const CalendarFilters = ({
  filters,
  onFiltersChange,
  onReserve
}: CalendarFiltersProps) => {
  return (
    <div
      style={{
        display: 'flex',
        padding: '10px',
        backgroundColor: '#f9f9f9',
        borderBottom: '1px solid #e5e5e5',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}
    >
      <DatePicker
        label="От"
        value={filters.startDate}
        onChange={date => onFiltersChange({ startDate: date })}
      />
      <DatePicker
        label="До"
        value={filters.endDate}
        onChange={date => onFiltersChange({ endDate: date })}
      />
      <Select
        label="Список"
        options={[
          { value: 'employee', label: 'Сотрудники' },
          { value: 'equipment', label: 'ТМЦ' }
        ]}
        value={['employee']}
        onChange={() => {}}
        multiSelect={false}
      />
      <Select
        label="Вид деятельности"
        options={[
          { value: 'development', label: 'Разработка' },
          { value: 'design', label: 'Дизайн' },
          { value: 'testing', label: 'Тестирование' }
        ]}
        value={filters.activityTypes}
        onChange={selected => onFiltersChange({ activityTypes: selected })}
        multiSelect={true}
      />
      <SearchInput
        label="Поиск по проекту"
        value={filters.projectName}
        onChange={value => onFiltersChange({ projectName: value })}
        placeholder="Название проекта"
      />
      <SearchInput
        label="Поиск по сотруднику"
        value=""
        onChange={value => {}}
        placeholder="Имя сотрудника"
      />
      <Button onClick={onReserve} type="primary">
        Зарезервировать
      </Button>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div>Легенда:</div>
        {Object.entries(STATUS_COLORS).map(([key, color]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: color,
                border: color === '#ffffff' ? '1px solid #d9d9d9' : 'none',
                borderRadius: '2px'
              }}
            ></div>
            <div style={{ fontSize: '12px' }}>
              {key === 'free'
                ? 'Свободно'
                : key === 'reserved'
                ? 'Забронировано'
                : key === 'overlap'
                ? 'Пересечение'
                : 'Планируется'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 