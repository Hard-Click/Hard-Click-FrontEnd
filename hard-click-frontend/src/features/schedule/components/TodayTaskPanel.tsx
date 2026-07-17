import type { TodayTask } from '../types';
import { TodayTaskChecklist } from './TodayTaskChecklist';
import { AddTaskButton } from './AddTaskButton';
import type { NewTaskInput } from './AddTaskModal';
import type { EditTaskInput } from './EditTaskModal';

interface TodayTaskPanelProps {
  date: string;
  tasks: readonly TodayTask[];
  onToggle: (id: string) => void;
  onAdd: (task: NewTaskInput) => Promise<boolean>;
  onEdit: (id: string, input: EditTaskInput) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function TodayTaskPanel({ date, tasks, onToggle, onAdd, onEdit, onDelete }: TodayTaskPanelProps) {
  const [, month, day] = date.split('-');

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#E2E8F0] bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1E293B]">
          {Number(month)}/{Number(day)}
        </h2>
        <AddTaskButton tasks={tasks} onAdd={onAdd} />
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <TodayTaskChecklist tasks={tasks} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}
