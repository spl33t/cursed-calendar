import { CELL_SIZE } from '../lib/constants';

type TimeSlotElementProps = {
  projectName: string;
  status: 'active' | 'pending' | 'completed';
  width: number;
  onClick: () => void;
};

const statusColors = {
  active: '#52c41a',
  pending: '#faad14',
  completed: '#d9d9d9'
};

export const TimeSlotElement = ({
  projectName,
  status,
  width,
  onClick
}: TimeSlotElementProps) => {
  return (
    <div
      onClick={onClick}
      style={{
        width: width * CELL_SIZE - 2, // Вычитаем границы
        height: CELL_SIZE - 2, // Вычитаем границы
        backgroundColor: statusColors[status],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#fff',
        borderRadius: '2px',
        cursor: 'pointer',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        padding: '0 4px',
        boxSizing: 'border-box'
      }}
    >
      {width > 1 ? projectName : ''}
    </div>
  );
}; 