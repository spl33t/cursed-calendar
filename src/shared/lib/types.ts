export type Employee = {
  id: string;
  name: string;
  activityType: string[];
};

export type TimeSlotStatus = 'active' | 'pending' | 'completed';

export type TimeSlot = {
  id: string;
  employeeId: string;
  projectName: string;
  startDate: string;
  endDate: string;
  status: TimeSlotStatus;
};

export type CalendarFilter = {
  startDate: Date;
  endDate: Date;
  employeeTypes: string[];
  activityTypes: string[];
  projectName: string;
  employeeNames: string[];
}; 