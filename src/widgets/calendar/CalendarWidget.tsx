import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CalendarHeader } from './CalendarHeader';
import { EmployeeSidebar } from './EmployeeSidebar';
import { CalendarGrid } from './CalendarGrid';
import { ReservationModal } from '../../features/calendar/ReservationModal';
import { CalendarFilters } from '../../features/calendar/CalendarFilters';
import { getDaysInRange } from '../../shared/lib/dateUtils';
import { SIDEBAR_WIDTH, CELL_SIZE } from '../../shared/lib/constants';
import { CalendarFilter, Employee, TimeSlot } from '../../shared/lib/types';
import { CustomScrollbar, CustomScrollbarRef } from '../../shared/ui/CustomScrollbar';
import { v4 as uuidv4 } from 'uuid';

// Определение типа пропсов
interface CalendarWidgetProps {
  employees: Employee[];
  initialTimeSlots?: TimeSlot[];
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export const CalendarWidget = ({
  employees,
  initialTimeSlots = [],
  initialStartDate = new Date('2024-03-01'),
  initialEndDate = new Date('2024-03-31'),
}: CalendarWidgetProps) => {
  // Состояние для фильтров
  const [filters, setFilters] = useState<CalendarFilter>({
    startDate: initialStartDate,
    endDate: initialEndDate,
    employeeTypes: [],
    activityTypes: [],
    projectName: '',
    employeeNames: []
  });

  // Состояние для отслеживания выделения ячеек
  const [selectedCells, setSelectedCells] = useState<{
    employeeId: string;
    dateIndexes: number[];
  } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  // Состояние для модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reservationData, setReservationData] = useState<{
    startDate: Date | null;
    endDate: Date | null;
    employeeId: string | null;
  }>({
    startDate: null,
    endDate: null,
    employeeId: null
  });

  // Состояние для хранения временных отрезков
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(initialTimeSlots);

  // Расчет списка дат в заданном диапазоне
  const dates = useMemo(() => {
    return getDaysInRange(filters.startDate, filters.endDate);
  }, [filters.startDate, filters.endDate]);

  // Фильтрованный список сотрудников
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee: Employee) => {
      // Фильтрация по типу деятельности
      if (
        filters.activityTypes.length > 0 &&
        !employee.activityType.some((type: string) => filters.activityTypes.includes(type))
      ) {
        return false;
      }

      // Фильтрация по имени сотрудника
      if (
        filters.employeeNames.length > 0 &&
        !filters.employeeNames.includes(employee.name)
      ) {
        return false;
      }

      return true;
    });
  }, [filters.activityTypes, filters.employeeNames, employees]);

  // Обработчики для выделения ячеек
  const handleCellMouseDown = (employeeId: string, dateIndex: number) => {
    setIsSelecting(true);
    setSelectedEmployee(employeeId);
    setSelectedCells({
      employeeId,
      dateIndexes: [dateIndex]
    });
  };

  const handleCellMouseUp = () => {
    setIsSelecting(false);

    // Если выделены ячейки, открываем модальное окно
    if (selectedCells && selectedCells.dateIndexes.length > 0) {
      const dateIndexes = [...selectedCells.dateIndexes].sort((a, b) => a - b);
      const startDate = dates[dateIndexes[0]];
      const endDate = dates[dateIndexes[dateIndexes.length - 1]];
      
      setReservationData({
        startDate,
        endDate,
        employeeId: selectedCells.employeeId
      });
      
      setIsModalOpen(true);
    }
  };

  const handleCellMouseOver = (employeeId: string, dateIndex: number) => {
    if (isSelecting && employeeId === selectedEmployee) {
      setSelectedCells(prev => {
        if (!prev) return null;
        
        // Добавляем новую ячейку в выделение, если её там еще нет
        if (!prev.dateIndexes.includes(dateIndex)) {
          return {
            ...prev,
            dateIndexes: [...prev.dateIndexes, dateIndex]
          };
        }
        
        return prev;
      });
    }
  };

  // Обработчик изменения фильтров
  const handleFiltersChange = (newFilters: Partial<CalendarFilter>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  // Обработчик для резервирования временного отрезка
  const handleReservation = (data: { projectName: string; status: 'active' | 'pending' }) => {
    if (
      !reservationData.startDate ||
      !reservationData.endDate ||
      !reservationData.employeeId
    ) {
      return;
    }

    const newTimeSlot: TimeSlot = {
      id: uuidv4(),
      employeeId: reservationData.employeeId,
      projectName: data.projectName,
      startDate: reservationData.startDate.toISOString().split('T')[0],
      endDate: reservationData.endDate.toISOString().split('T')[0],
      status: data.status
    };

    // Проверка на пересечения с существующими отрезками
    const employeeTimeSlots = timeSlots.filter(
      slot => slot.employeeId === reservationData.employeeId
    );

    const newStart = new Date(newTimeSlot.startDate);
    const newEnd = new Date(newTimeSlot.endDate);

    // Проверяем каждый существующий отрезок на пересечение
    for (const slot of employeeTimeSlots) {
      const existingStart = new Date(slot.startDate);
      const existingEnd = new Date(slot.endDate);

      // Проверка на пересечение дат
      if (
        (newStart <= existingEnd && newEnd >= existingStart) ||
        (existingStart <= newEnd && existingEnd >= newStart)
      ) {
        // Если есть пересечение, меняем статус на 'completed'
        newTimeSlot.status = 'completed';
        break;
      }
    }

    setTimeSlots(prev => [...prev, newTimeSlot]);
    setIsModalOpen(false);
    setSelectedCells(null);
  };

  // Обработчик для открытия модального окна для резервирования
  const handleOpenReservationModal = () => {
    if (selectedCells && selectedCells.dateIndexes.length > 0) {
      const dateIndexes = [...selectedCells.dateIndexes].sort((a, b) => a - b);
      const startDate = dates[dateIndexes[0]];
      const endDate = dates[dateIndexes[dateIndexes.length - 1]];
      
      setReservationData({
        startDate,
        endDate,
        employeeId: selectedCells.employeeId
      });
      
      setIsModalOpen(true);
    } else {
      // Если ничего не выделено, показываем сообщение пользователю
      alert('Пожалуйста, выделите диапазон дат для резервирования');
    }
  };

  // Имя выбранного сотрудника для модального окна
  const selectedEmployeeName = reservationData.employeeId
    ? employees.find((emp: Employee) => emp.id === reservationData.employeeId)?.name || null
    : null;
    
  // Ссылка на DOM-элементы для синхронизации скролла
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const sidebarContainerRef = useRef<HTMLDivElement>(null);
  const employeeSidebarParentRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<CustomScrollbarRef>(null);
  
  // Оптимизированный callback для получения dom-элемента скролла
  const getScrollElement = useCallback(() => 
    scrollbarRef.current?.contentRef?.current || null, 
    [scrollbarRef]
  );

  // Виртуализация списка сотрудников с оптимизированными настройками
  const employeeVirtualizer = useVirtualizer({
    count: filteredEmployees.length,
    getScrollElement,
    estimateSize: useCallback(() => CELL_SIZE, []),
    overscan: 20, // Увеличиваем количество элементов за пределами видимой области
    getItemKey: useCallback((index: number) => filteredEmployees[index]?.id || index, [filteredEmployees])
  });
  
  // Оптимизированный обработчик скролла с использованием RAF
  const handleScrollbarScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    // Используем requestAnimationFrame для улучшения производительности
    const target = e.currentTarget;
    
    requestAnimationFrame(() => {
      // Синхронизируем горизонтальный скролл с шапкой
      if (headerContainerRef.current) {
        headerContainerRef.current.scrollLeft = target.scrollLeft;
      }
      
      // Синхронизируем вертикальный скролл с sidebar
      if (sidebarContainerRef.current) {
        sidebarContainerRef.current.scrollTop = target.scrollTop;
      }
    });
  }, []);

  // Обработчик колесика мыши для шапки - прокручивает основную область
  const handleHeaderWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Находим DOM-элемент внутреннего контента скроллбара
    const scrollbarContent = scrollbarRef.current?.contentRef?.current;
    
    if (scrollbarContent) {
      // Если зажат Shift или горизонтальная прокрутка (deltaX не равен 0),
      // то используем соответствующую дельту для горизонтальной прокрутки
      const deltaX = e.shiftKey || Math.abs(e.deltaX) > 0 ? (e.deltaX || e.deltaY) : e.deltaY;
      scrollbarContent.scrollLeft += deltaX * 2;
      
      // Обрабатываем вертикальный скролл, если deltaY != 0 и не зажат Shift
      // В этом случае используем deltaY напрямую
      if (!e.shiftKey && Math.abs(e.deltaY) > 0 && Math.abs(e.deltaX) === 0) {
        scrollbarContent.scrollTop += e.deltaY;
      }
    }
  };
  
  // Обработчик колесика мыши для сайдбара - прокручивает основную область
  const handleSidebarWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Находим DOM-элемент внутреннего контента скроллбара
    const scrollbarContent = scrollbarRef.current?.contentRef?.current;
    
    if (scrollbarContent) {
      // Обрабатываем вертикальный скролл по умолчанию
      scrollbarContent.scrollTop += e.deltaY;
      
      // Обрабатываем горизонтальный скролл, если есть deltaX или зажат Shift
      if (e.shiftKey || Math.abs(e.deltaX) > 0) {
        const deltaX = Math.abs(e.deltaX) > 0 ? e.deltaX : e.deltaY;
        scrollbarContent.scrollLeft += deltaX * 2;
      }
    }
  };

  // Обработчик колесика мыши для всего контейнера календаря
  const handleCalendarWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Предотвращаем дальнейшее распространение события скролла (блокируем скролл браузера)
    e.stopPropagation();
    
    // Получаем доступ к содержимому скроллбара
    const scrollbarContent = scrollbarRef.current?.contentRef?.current;
    
    if (scrollbarContent) {
      // Проверяем достижение границ скролла только если мы на краю
      // При скролле вниз и достижении нижней границы
      if (e.deltaY > 0 && scrollbarContent.scrollTop + scrollbarContent.clientHeight >= scrollbarContent.scrollHeight) {
        e.preventDefault();
      } 
      // При скролле вверх и достижении верхней границы
      else if (e.deltaY < 0 && scrollbarContent.scrollTop <= 0) {
        e.preventDefault();
      }
      // При скролле вправо и достижении правой границы 
      else if (e.deltaX > 0 && scrollbarContent.scrollLeft + scrollbarContent.clientWidth >= scrollbarContent.scrollWidth) {
        e.preventDefault();
      }
      // При скролле влево и достижении левой границы
      else if (e.deltaX < 0 && scrollbarContent.scrollLeft <= 0) {
        e.preventDefault();
      }
      // В остальных случаях не блокируем действие по умолчанию, 
      // позволяя скроллбару прокручиваться как обычно
    } else {
      // Если скроллбар недоступен, предотвращаем действие по умолчанию
      e.preventDefault();
    }
  };

  // Обработчик для блокировки скролла страницы при наведении на календарь
  const handleMouseEnter = () => {
    // Получаем текущую ширину страницы
    const scrollWidth = window.innerWidth - document.documentElement.clientWidth;
    // Сохраняем текущую позицию скролла
    const scrollPosition = window.scrollY;
    
    // Добавляем отступ справа, равный ширине полосы прокрутки
    document.body.style.paddingRight = `${scrollWidth}px`;
    // Блокируем скролл
    document.body.style.overflow = 'hidden';
    document.body.dataset.scrollPosition = scrollPosition.toString();
  };
  
  // Обработчик для разблокировки скролла страницы при уходе с календаря
  const handleMouseLeave = () => {
    // Удаляем отступ справа
    document.body.style.paddingRight = '';
    // Разблокируем скролл
    document.body.style.overflow = '';
    
    // Восстанавливаем позицию скролла
    if (document.body.dataset.scrollPosition) {
      window.scrollTo(0, parseInt(document.body.dataset.scrollPosition));
    }
  };

  return (
    <div 
      style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}
      onWheel={handleCalendarWheel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CalendarFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReserve={handleOpenReservationModal}
      />
      
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex' }}>
          <div 
            style={{ 
              minWidth: SIDEBAR_WIDTH, 
              height: CELL_SIZE * 3, 
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingLeft: '10px',
              fontWeight: 'bold',
              borderBottom: '1px solid #e5e5e5',
              borderRight: '1px solid #e5e5e5',
              boxSizing: 'border-box'
            }}
          >
            Сотрудники
          </div>
          <div 
            ref={headerContainerRef}
            style={{ 
              overflow: 'hidden',
              width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            onWheel={handleHeaderWheel}
          >
            <style>
              {`
                div[ref="headerContainerRef"]::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>
            <div style={{ 
              width: CELL_SIZE * dates.length,
              minWidth: CELL_SIZE * dates.length
            }}>
              <CalendarHeader dates={dates} />
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div
            ref={sidebarContainerRef}
            style={{ 
              width: SIDEBAR_WIDTH,
              minWidth: SIDEBAR_WIDTH,
              overflow: 'hidden',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            onWheel={handleSidebarWheel}
          >
            <EmployeeSidebar
              employees={filteredEmployees}
              selectedEmployee={selectedEmployee}
              onSelectEmployee={id => setSelectedEmployee(id)}
              virtualRows={employeeVirtualizer.getVirtualItems()}
              parentRef={employeeSidebarParentRef}
              totalHeight={employeeVirtualizer.getTotalSize()}
            />
          </div>
          
          <CustomScrollbar
            ref={scrollbarRef}
            style={{ 
              flex: 1,
              height: '100%',
              width: `calc(100% - ${SIDEBAR_WIDTH}px)`
            }}
            scrollbarSize={10}
            scrollbarRadius={5}
            trackColor="#f0f0f0"
            thumbColor="#c0c0c0"
            thumbHoverColor="#a0a0a0"
            onScroll={handleScrollbarScroll}
          >
            <div
              style={{ 
                width: CELL_SIZE * dates.length,
                minWidth: CELL_SIZE * dates.length
              }}
            >
              <CalendarGrid
                employees={filteredEmployees}
                timeSlots={timeSlots}
                dates={dates}
                onCellMouseDown={handleCellMouseDown}
                onCellMouseUp={handleCellMouseUp}
                onCellMouseOver={handleCellMouseOver}
                selectedCells={selectedCells}
                virtualRows={employeeVirtualizer.getVirtualItems()}
                totalHeight={employeeVirtualizer.getTotalSize()}
              />
            </div>
          </CustomScrollbar>
        </div>
      </div>
      
      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCells(null);
        }}
        onSubmit={handleReservation}
        startDate={reservationData.startDate}
        endDate={reservationData.endDate}
        employeeName={selectedEmployeeName}
      />
    </div>
  );
}; 