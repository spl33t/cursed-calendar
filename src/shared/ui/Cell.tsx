import { CELL_SIZE } from '../lib/constants';

type CellProps = {
  children?: React.ReactNode;
  color?: string;
  onClick?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onMouseOver?: () => void;
};

export const Cell = ({
  children,
  color = '#ffffff',
  onClick,
  onMouseDown,
  onMouseUp,
  onMouseOver
}: CellProps) => {
  return (
    <div
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: color,
        border: '1px solid #e5e5e5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseOver={onMouseOver}
    >
      {children}
    </div>
  );
}; 