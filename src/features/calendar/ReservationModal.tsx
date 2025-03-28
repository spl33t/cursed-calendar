import { useState, useEffect } from 'react';
import { Button } from '../../shared/ui/Button';
import { formatDate } from '../../shared/lib/dateUtils';

type ReservationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { projectName: string; status: 'active' | 'pending' }) => void;
  startDate: Date | null;
  endDate: Date | null;
  employeeName: string | null;
};

export const ReservationModal = ({
  isOpen,
  onClose,
  onSubmit,
  startDate,
  endDate,
  employeeName
}: ReservationModalProps) => {
  const [projectName, setProjectName] = useState('');
  const [status, setStatus] = useState<'active' | 'pending'>('active');

  // Сбрасываем форму при открытии
  useEffect(() => {
    if (isOpen) {
      setProjectName('');
      setStatus('active');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (projectName.trim()) {
      onSubmit({
        projectName,
        status
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal ${isOpen ? 'show' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Бронирование времени</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>Сотрудник:</label>
            <div>{employeeName || 'Не выбран'}</div>
          </div>
          
          <div className="form-group">
            <label>Период:</label>
            <div>
              {startDate && endDate
                ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                : 'Не выбран'}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="project-name">Название проекта:</label>
            <input
              id="project-name"
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="Введите название проекта"
            />
          </div>
          
          <div className="form-group">
            <label>Статус:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                />
                Активный
              </label>
              <label>
                <input
                  type="radio"
                  name="status"
                  value="pending"
                  checked={status === 'pending'}
                  onChange={() => setStatus('pending')}
                />
                В ожидании
              </label>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button onClick={onClose}>Отмена</button>
          <button 
            onClick={handleSubmit}
            disabled={!projectName.trim()}
          >
            Забронировать
          </button>
        </div>
      </div>
    </div>
  );
}; 