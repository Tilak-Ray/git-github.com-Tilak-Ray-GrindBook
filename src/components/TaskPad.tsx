import React, { useState, useEffect } from 'react';
import { Plus, Check, Square, Trash2, Zap, Target } from 'lucide-react';
import { auth } from '../lib/firebase';
import { addTask as addTaskToDB, subscribeToTasks, toggleTask, deleteTaskFromDB } from '../lib/db';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority?: 'standard' | 'urgent' | 'critical';
}

interface TaskPadProps {
  userId: string;
}

export const TaskPad: React.FC<TaskPadProps> = ({ userId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<'standard' | 'urgent' | 'critical'>('standard');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeToTasks(userId, (updatedTasks) => {
      setTasks(updatedTasks);
    });
    return () => unsubscribe();
  }, [userId]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || isAdding || !userId) return;
    
    setIsAdding(true);
    try {
      await addTaskToDB(userId, newTask, priority);
      setNewTask('');
      setPriority('standard');
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!userId) return;
    try {
      await toggleTask(userId, taskId, !currentStatus);
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!userId) return;
    try {
      await deleteTaskFromDB(userId, taskId);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  return (
    <div className="tech-panel p-8 bg-[var(--tech-inner)] border-[var(--tech-border)]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
           <Target size={18} className="text-[var(--tech-accent)]" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--tech-accent)] tech-glow-text">Directive_Module</h3>
        </div>
        <span className="font-mono text-[9px] text-[var(--tech-text-dim)] border border-[var(--tech-border)] px-2 py-0.5">
          {tasks.filter(t => t.completed).length}/{tasks.length} SYNCED
        </span>
      </div>

      <form onSubmit={handleAddTask} className="mb-10 p-1 tech-indent flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center">
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder={userId ? "INITIATE_TASK..." : "AUTH_REQUIRED"}
          disabled={!userId || isAdding}
          className="flex-1 bg-transparent px-4 py-3 text-[11px] font-bold uppercase tracking-widest outline-none text-[var(--tech-text)] placeholder:text-zinc-700 disabled:opacity-50"
        />
        <div className="flex items-center space-x-2 px-4 border-l border-[var(--tech-border)]/20">
           {(['standard', 'urgent', 'critical'] as const).map(p => (
             <button
               key={p}
               type="button"
               onClick={() => setPriority(p)}
               className={`w-3 h-3 rounded-full border transition-all ${
                 priority === p 
                   ? p === 'critical' ? 'bg-red-500 border-red-500 shadow-[0_0_8px_red]' : p === 'urgent' ? 'bg-orange-500 border-orange-500 shadow-[0_0_8px_orange]' : 'bg-[var(--tech-accent)] border-[var(--tech-accent)] shadow-[0_0_8px_var(--tech-glow)]'
                   : 'bg-transparent border-zinc-800'
               }`}
               title={p.toUpperCase()}
             />
           ))}
        </div>
        <button 
          type="submit" 
          disabled={!newTask.trim() || isAdding || !userId}
          className="bg-[var(--tech-accent)] text-black px-6 py-3 font-black hover:opacity-80 transition-all disabled:opacity-30 disabled:grayscale shrink-0"
        >
          {isAdding ? <div className="w-4 h-4 border-t-2 border-black rounded-full animate-spin"></div> : <Plus size={18} />}
        </button>
      </form>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className={`group flex items-center p-5 border transition-all duration-300 relative ${
              task.completed 
                ? 'border-transparent bg-black/10 opacity-40' 
                : 'border-[var(--tech-border)] bg-[var(--tech-indent-bg)] hover:border-[var(--tech-accent)]/30'
            }`}
          >
            {!task.completed && (
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--tech-accent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            )}
            <button 
              onClick={() => handleToggleTask(task.id, task.completed)}
              className={`mr-4 transition-all ${task.completed ? 'text-[var(--tech-accent)]' : 'text-[var(--tech-text-dim)] hover:text-[var(--tech-accent)]'}`}
            >
              {task.completed ? <Check size={20} className="border border-[var(--tech-accent)] bg-[var(--tech-accent)]/10 rounded-sm p-0.5" strokeWidth={3} /> : <Square size={20} />}
            </button>
            <span className={`flex-1 text-[11px] font-black uppercase tracking-widest ${task.completed ? 'line-through text-[var(--tech-text-dim)]' : 'text-[var(--tech-text)]'}`}>
              <span className="flex items-center space-x-3">
                {task.title}
                {task.priority !== 'standard' && (
                  <span className={`text-[7px] px-1.5 py-0.5 border font-mono tracking-tighter shrink-0 ${
                    task.priority === 'critical' ? 'text-red-500 border-red-500/30 bg-red-500/5' : 'text-orange-500 border-orange-500/30 bg-orange-500/5'
                  }`}>
                    {task.priority?.toUpperCase()}
                  </span>
                )}
              </span>
            </span>
            <button 
              onClick={() => handleDeleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-500 transition-all ml-4"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-10 border border-dashed border-[var(--tech-border)] bg-black/20">
            <p className="text-[9px] uppercase text-[var(--tech-text-dim)] font-black tracking-[0.3em] italic">No Active Directives Detectable</p>
          </div>
        )}
      </div>
    </div>
  );
};
