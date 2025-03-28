import { v4 as uuidv4 } from 'uuid';
import { Employee, TimeSlot, TimeSlotStatus } from './types';

// Генератор имен
const firstNames = [
  'Иван', 'Петр', 'Алексей', 'Сергей', 'Михаил', 'Дмитрий', 'Андрей', 'Николай', 'Владимир',
  'Александр', 'Анна', 'Мария', 'Елена', 'Ольга', 'Наталья', 'Екатерина', 'Татьяна', 'Ирина',
  'Светлана', 'Юлия', 'Артем', 'Максим', 'Кирилл', 'Никита', 'Даниил'
];

const lastNames = [
  'Иванов', 'Петров', 'Сидоров', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Соколов',
  'Михайлов', 'Новиков', 'Федоров', 'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семенов',
  'Егоров', 'Павлов', 'Козлов', 'Степанов', 'Николаев', 'Орлов', 'Андреев', 'Макаров', 'Никитин'
];

// Типы деятельности
const activityTypes = [
  'development', 'design', 'testing', 'management', 'analytics', 'marketing', 'support'
];

// Названия проектов
const projectNames = [
  'Проект А', 'Проект Б', 'Проект В', 'Проект Г', 'Проект Д', 'Сайт компании', 'Мобильное приложение',
  'CRM-система', 'Аналитическая платформа', 'Облачное хранилище', 'Система безопасности', 
  'Интеграционный сервис', 'Портал обучения', 'E-commerce платформа', 'Личный кабинет',
  'Модуль отчетности', 'Административная панель', 'API-сервис', 'Модуль аутентификации'
];

// Функция для генерации случайного элемента из массива
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Функция для генерации случайной даты в заданном диапазоне
const getRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Функция для генерации массива случайных типов деятельности
const getRandomActivityTypes = (): string[] => {
  const count = Math.floor(Math.random() * 3) + 1; // От 1 до 3 типов
  const types: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const type = getRandomElement(activityTypes);
    if (!types.includes(type)) {
      types.push(type);
    }
  }
  
  return types;
};

// Генерация списка сотрудников
export const generateEmployees = (count: number = 100): Employee[] => {
  const employees: Employee[] = [];
  
  const usedNames = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let fullName = '';
    
    // Гарантируем уникальность имен
    do {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      
      // Для женских имён изменяем окончание фамилии
      if (firstName.endsWith('а') || firstName.endsWith('я')) {
        fullName = `${lastName}а ${firstName}`;
      } else {
        fullName = `${lastName} ${firstName}`;
      }
    } while (usedNames.has(fullName));
    
    usedNames.add(fullName);
    
    employees.push({
      id: uuidv4(),
      name: fullName,
      activityType: getRandomActivityTypes()
    });
  }
  
  return employees;
};

// Генерация временных отрезков
export const generateTimeSlots = (
  employees: Employee[],
  startDate: Date,
  endDate: Date,
  density: number = 0.3 // Плотность заполнения (0-1)
): TimeSlot[] => {
  const timeSlots: TimeSlot[] = [];
  
  employees.forEach(employee => {
    // Определяем количество временных отрезков для сотрудника (зависит от плотности)
    const slotsCount = Math.floor(Math.random() * 5 * density) + 1;
    
    for (let i = 0; i < slotsCount; i++) {
      // Генерируем случайные даты начала и окончания
      const slotStartDate = getRandomDate(startDate, new Date(endDate.getTime() - 2 * 24 * 60 * 60 * 1000));
      
      // Длительность от 1 до 10 дней
      const durationDays = Math.floor(Math.random() * 10) + 1;
      const slotEndDate = new Date(slotStartDate);
      slotEndDate.setDate(slotStartDate.getDate() + durationDays);
      
      // Убеждаемся, что дата окончания не выходит за границы заданного диапазона
      if (slotEndDate > endDate) {
        slotEndDate.setTime(endDate.getTime());
      }
      
      timeSlots.push({
        id: uuidv4(),
        employeeId: employee.id,
        projectName: getRandomElement(projectNames),
        startDate: slotStartDate.toISOString().split('T')[0],
        endDate: slotEndDate.toISOString().split('T')[0],
        status: getRandomElement(['active', 'pending', 'completed']) as TimeSlotStatus
      });
    }
  });
  
  return timeSlots;
}; 