import { cn, getStatusColor } from '../../utils/helpers';

export default function StatusBadge({ status }) {
  const labels = {
    PAID: 'Paid',
    PENDING: 'Pending',
    OVERDUE: 'Overdue',
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
  };

  return (
    <span className={cn('status-badge', getStatusColor(status))}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {labels[status] || status}
    </span>
  );
}
