import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus, X, ClipboardList, User, Calendar, Settings, Trash2, ToggleLeft, ToggleRight, AlertCircle, Check } from 'lucide-react';
import { THEME } from '../../theme';
import { FloatingLabelInput } from '../common/FloatingLabelInput';
import type { Employee, TaskTemplate, DailyTask, TaskIncompleteReport } from '../../types';

interface DailyTasksDashboardProps {
    employees: Employee[];
    taskTemplates: TaskTemplate[];
    dailyTasks: DailyTask[];
    taskIncompleteReports: TaskIncompleteReport[];
    onAddTemplate: (template: Omit<TaskTemplate, 'id'>) => void;
    onDeleteTemplate: (id: number) => void;
    onToggleTemplateActive: (id: number) => void;
    onUpdateTemplateAssignees: (id: number, assignedTo: number[]) => void;
    onAddDailyTask: (task: Omit<DailyTask, 'id'>) => void;
    onBack: () => void;
}

export const DailyTasksDashboard: React.FC<DailyTasksDashboardProps> = ({
    employees,
    taskTemplates,
    dailyTasks,
    taskIncompleteReports,
    onAddTemplate,
    onDeleteTemplate,
    onToggleTemplateActive,
    onUpdateTemplateAssignees,
    onAddDailyTask,
    onBack
}) => {
    const [activeTab, setActiveTab] = useState<'today' | 'templates'>('today');
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateAssignees, setNewTemplateAssignees] = useState<number[]>([]);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskAssignee, setNewTaskAssignee] = useState<number | ''>('');
    const [showAddTask, setShowAddTask] = useState(false);
    // State for adding employees to existing templates
    const [addingToTemplate, setAddingToTemplate] = useState<number | null>(null);
    const [addingEmployeeSelect, setAddingEmployeeSelect] = useState<number | ''>('');

    const today = new Date().toISOString().split('T')[0];

    const todaysTasks = useMemo(() => {
        return dailyTasks.filter(task => task.date === today);
    }, [dailyTasks, today]);

    const todaysReports = useMemo(() => {
        return taskIncompleteReports.filter(r => r.date === today);
    }, [taskIncompleteReports, today]);

    const tasksByEmployee = useMemo(() => {
        const grouped: Record<number, DailyTask[]> = {};
        employees.forEach(emp => {
            grouped[emp.id] = todaysTasks.filter(task => task.assignedTo === emp.id);
        });
        return grouped;
    }, [todaysTasks, employees]);

    const handleAddTemplate = () => {
        if (newTemplateName.trim()) {
            onAddTemplate({
                name: newTemplateName.trim(),
                assignedTo: newTemplateAssignees,
                isActive: true
            });
            setNewTemplateName('');
            setNewTemplateAssignees([]);
        }
    };

    const handleAddAssigneeToTemplate = (templateId: number, currentAssignees: number[]) => {
        if (addingEmployeeSelect !== '') {
            onUpdateTemplateAssignees(templateId, [...currentAssignees, addingEmployeeSelect as number]);
            setAddingEmployeeSelect('');
            setAddingToTemplate(null);
        }
    };

    const handleRemoveAssigneeFromTemplate = (templateId: number, currentAssignees: number[], employeeId: number) => {
        onUpdateTemplateAssignees(templateId, currentAssignees.filter(id => id !== employeeId));
    };

    const handleAddDailyTask = () => {
        if (newTaskName.trim() && newTaskAssignee !== '') {
            onAddDailyTask({
                templateId: null,
                name: newTaskName.trim(),
                assignedTo: newTaskAssignee as number,
                date: today,
                completed: false
            });
            setNewTaskName('');
            setNewTaskAssignee('');
            setShowAddTask(false);
        }
    };

    const getEmployeeName = (id: number) => {
        return employees.find(e => e.id === id)?.name || 'Unknown';
    };

    const getReportsForTask = (taskId: number) => {
        return todaysReports.filter(r => r.taskId === taskId);
    };

    const getIncompleteReportCount = (employeeId: number) => {
        const empTasks = tasksByEmployee[employeeId] || [];
        let count = 0;
        empTasks.forEach(task => {
            if (getReportsForTask(task.id).length > 0) {
                count++;
            }
        });
        return count;
    };

    return (
        <div className="min-h-screen bg-[#F1F8FB] p-6 lg:p-10">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="animate-fade-in-right flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className={`p-3 hover:bg-white ${THEME.shapes.full} ${THEME.animation.spring} ${THEME.elevation.low}`}
                        >
                            <ArrowLeft className="w-6 h-6 text-[#37474F]" />
                        </button>
                        <div className="flex items-center gap-4">
                            <img src="./janhavi-logo.jpg" alt="Janhavi Medicals" className="w-16 h-16 object-contain" />
                            <div>
                                <h1 className={`${THEME.typography.displayMedium} text-[#263238]`}>Daily Tasks</h1>
                                <p className={`${THEME.typography.bodyLarge} text-[#37474F] mt-1`}>
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 bg-white p-1.5 rounded-full shadow-sm">
                        <button
                            onClick={() => setActiveTab('today')}
                            className={`px-6 py-2.5 rounded-full ${THEME.typography.labelLarge} ${THEME.animation.spring} ${
                                activeTab === 'today'
                                    ? 'bg-[#0277BD] text-white shadow-md'
                                    : 'text-[#37474F] hover:bg-[#CFE9F3]'
                            }`}
                        >
                            <ClipboardList className="w-4 h-4 inline mr-2" />
                            Today's Tasks
                        </button>
                        <button
                            onClick={() => setActiveTab('templates')}
                            className={`px-6 py-2.5 rounded-full ${THEME.typography.labelLarge} ${THEME.animation.spring} ${
                                activeTab === 'templates'
                                    ? 'bg-[#0277BD] text-white shadow-md'
                                    : 'text-[#37474F] hover:bg-[#CFE9F3]'
                            }`}
                        >
                            <Settings className="w-4 h-4 inline mr-2" />
                            Templates
                        </button>
                    </div>
                </header>

                {activeTab === 'today' ? (
                    /* Today's Tasks View */
                    <div className="space-y-6">
                        {/* Info Banner */}
                        <div className={`bg-[#B3E5FC]/30 ${THEME.shapes.extraLarge} p-5 border border-[#B3E5FC]`}>
                            <p className={`${THEME.typography.bodyLarge} text-[#01579B]`}>
                                <AlertCircle className="w-5 h-5 inline mr-2" />
                                Task completion is now monitored by peers during the rating process.
                                Tasks reported as incomplete by colleagues are highlighted below.
                            </p>
                        </div>

                        {/* Add Task Button */}
                        {!showAddTask ? (
                            <button
                                onClick={() => setShowAddTask(true)}
                                className={`${THEME.colors.primary} ${THEME.shapes.full} px-6 py-3 flex items-center gap-2 ${THEME.elevation.low} hover:${THEME.elevation.medium} ${THEME.animation.spring}`}
                            >
                                <Plus className="w-5 h-5" />
                                Add Extra Task
                            </button>
                        ) : (
                            <div className={`bg-white ${THEME.shapes.extraLarge} p-6 ${THEME.elevation.medium} border border-[#CFE9F3]`}>
                                <h3 className={`${THEME.typography.titleLarge} text-[#263238] mb-4`}>Add Extra Task</h3>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <FloatingLabelInput
                                            value={newTaskName}
                                            onChange={(e) => setNewTaskName(e.target.value)}
                                            placeholder="Task Name"
                                        />
                                    </div>
                                    <select
                                        value={newTaskAssignee}
                                        onChange={(e) => setNewTaskAssignee(e.target.value ? Number(e.target.value) : '')}
                                        className={`h-[56px] px-4 bg-[#CFE9F3] ${THEME.shapes.medium} border-2 border-transparent focus:border-[#0277BD] outline-none text-[#263238]`}
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                                        ))}
                                    </select>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAddDailyTask}
                                            className={`${THEME.colors.primary} ${THEME.shapes.full} px-6 py-3 flex items-center gap-2`}
                                        >
                                            <Plus className="w-5 h-5" />
                                            Add
                                        </button>
                                        <button
                                            onClick={() => { setShowAddTask(false); setNewTaskName(''); setNewTaskAssignee(''); }}
                                            className={`border-2 border-[#546E7A] text-[#37474F] ${THEME.shapes.full} px-4 py-3 hover:bg-[#CFE9F3]`}
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tasks by Employee */}
                        {employees.length === 0 ? (
                            <div className={`text-center py-20 ${THEME.shapes.extraLarge} bg-white border border-[#CFE9F3]`}>
                                <div className="w-20 h-20 bg-[#CFE9F3] rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <User className="w-8 h-8 text-[#37474F]" />
                                </div>
                                <h3 className={`${THEME.typography.headlineSmall} text-[#263238] mb-2`}>No Employees Yet</h3>
                                <p className={`${THEME.typography.bodyLarge} text-[#37474F]`}>Add employees from the Employees section first.</p>
                            </div>
                        ) : (
                            employees.map((emp, idx) => {
                                const tasks = tasksByEmployee[emp.id] || [];
                                const incompleteCount = getIncompleteReportCount(emp.id);

                                return (
                                    <div
                                        key={emp.id}
                                        className={`bg-white ${THEME.shapes.asymmetric2} p-6 ${THEME.elevation.low} border-2 ${
                                            incompleteCount > 0 ? 'border-[#FFE0B2]' : 'border-[#CFE9F3]'
                                        } animate-fade-in-up`}
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            {emp.photo ? (
                                                <img src={emp.photo} alt={emp.name} className="w-12 h-12 rounded-full object-cover" />
                                            ) : (
                                                <div className={`w-12 h-12 rounded-full ${emp.avatar} flex items-center justify-center text-white text-lg font-bold`}>
                                                    {emp.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className={`${THEME.typography.titleLarge} text-[#263238]`}>{emp.name}</h3>
                                                <p className={`${THEME.typography.bodyMedium} text-[#37474F]`}>
                                                    {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned
                                                    {incompleteCount > 0 && (
                                                        <span className="text-[#E65100] ml-2">
                                                            ({incompleteCount} reported incomplete)
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            {incompleteCount > 0 && (
                                                <div className={`px-4 py-2 rounded-full text-sm font-medium bg-[#FFE0B2] text-[#E65100]`}>
                                                    <AlertCircle className="w-4 h-4 inline mr-1" />
                                                    Issues Reported
                                                </div>
                                            )}
                                        </div>

                                        {tasks.length === 0 ? (
                                            <p className={`${THEME.typography.bodyMedium} text-[#37474F] italic py-4 text-center`}>
                                                No tasks assigned for today
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {tasks.map(task => {
                                                    const reports = getReportsForTask(task.id);
                                                    const hasIssues = reports.length > 0;

                                                    return (
                                                        <div
                                                            key={task.id}
                                                            className={`p-3 rounded-lg ${
                                                                hasIssues ? 'bg-[#FFE0B2]/30 border border-[#FFE0B2]' : 'bg-[#CFE9F3]/50'
                                                            } ${THEME.animation.spring}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className={`flex-1 ${THEME.typography.bodyLarge} text-[#263238]`}>
                                                                    {task.name}
                                                                </span>
                                                                {task.templateId === null && (
                                                                    <span className="text-xs px-2 py-1 bg-[#B3E5FC] text-[#01579B] rounded-full">Extra</span>
                                                                )}
                                                                {hasIssues && (
                                                                    <span className="text-xs px-2 py-1 bg-[#FFE0B2] text-[#E65100] rounded-full">
                                                                        {reports.length} report{reports.length > 1 ? 's' : ''}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {hasIssues && (
                                                                <div className="mt-2 pt-2 border-t border-[#FFE0B2]">
                                                                    <p className={`${THEME.typography.bodyMedium} text-[#E65100] text-sm`}>
                                                                        Reported incomplete by: {reports.map(r => r.reporterName).join(', ')}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                ) : (
                    /* Templates View */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Add Template Form */}
                        <div className={`lg:col-span-4 bg-gradient-to-br from-[#CFE9F3] to-[#B3E5FC]/50 ${THEME.shapes.asymmetric1} p-8 ${THEME.elevation.medium} h-fit sticky top-6`}>
                            <h2 className={`${THEME.typography.headlineMedium} mb-8 text-[#263238]`}>Add Template</h2>
                            <div className="space-y-6">
                                <FloatingLabelInput
                                    value={newTemplateName}
                                    onChange={(e) => setNewTemplateName(e.target.value)}
                                    placeholder="Task Name"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTemplate()}
                                />

                                <div>
                                    <label className={`${THEME.typography.labelLarge} text-[#37474F] mb-2 block`}>Assign To</label>
                                    {newTemplateAssignees.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {newTemplateAssignees.map(id => (
                                                <span key={id} className="inline-flex items-center gap-1 px-3 py-1 bg-[#B3E5FC] text-[#01579B] rounded-full text-sm font-medium">
                                                    {getEmployeeName(id)}
                                                    <button
                                                        onClick={() => setNewTemplateAssignees(prev => prev.filter(x => x !== id))}
                                                        className="ml-1 hover:text-[#B71C1C] transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <select
                                        value=""
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            if (val && !newTemplateAssignees.includes(val)) {
                                                setNewTemplateAssignees(prev => [...prev, val]);
                                            }
                                        }}
                                        className={`w-full h-[56px] px-4 bg-white ${THEME.shapes.medium} border-2 border-transparent focus:border-[#0277BD] outline-none text-[#263238]`}
                                    >
                                        <option value="">{newTemplateAssignees.length === 0 ? 'Select Employee' : 'Add Another Employee...'}</option>
                                        {employees.filter(emp => !newTemplateAssignees.includes(emp.id)).map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={handleAddTemplate}
                                    disabled={!newTemplateName.trim()}
                                    className={`w-full ${THEME.colors.primary} ${THEME.shapes.full} py-3.5 px-6 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Template
                                </button>
                            </div>

                            <div className={`mt-8 p-4 bg-white/50 ${THEME.shapes.medium}`}>
                                <p className={`${THEME.typography.bodyMedium} text-[#37474F] text-sm`}>
                                    <strong>Note:</strong> Active templates automatically create tasks for assigned employees each day.
                                </p>
                            </div>
                        </div>

                        {/* Templates List */}
                        <div className="lg:col-span-8 space-y-4">
                            {taskTemplates.length === 0 ? (
                                <div className={`text-center py-20 ${THEME.shapes.extraLarge} bg-white border border-[#CFE9F3]`}>
                                    <div className="w-20 h-20 bg-[#CFE9F3] rounded-full flex items-center justify-center mb-6 mx-auto">
                                        <ClipboardList className="w-8 h-8 text-[#37474F]" />
                                    </div>
                                    <h3 className={`${THEME.typography.headlineSmall} text-[#263238] mb-2`}>No Templates Yet</h3>
                                    <p className={`${THEME.typography.bodyLarge} text-[#37474F]`}>Create your first recurring task template.</p>
                                </div>
                            ) : (
                                taskTemplates.map((template, idx) => (
                                    <div
                                        key={template.id}
                                        className={`bg-white ${THEME.shapes.asymmetric2} p-6 ${THEME.elevation.low} border-2 ${
                                            template.isActive ? 'border-[#B2DFDB]' : 'border-[#CFE9F3]'
                                        } ${THEME.animation.spring} hover:${THEME.elevation.medium} animate-fade-in-up flex items-start gap-4`}
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <button
                                            onClick={() => onToggleTemplateActive(template.id)}
                                            className={`${THEME.animation.spring}`}
                                            title={template.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            {template.isActive ? (
                                                <ToggleRight className="w-8 h-8 text-[#00897B]" />
                                            ) : (
                                                <ToggleLeft className="w-8 h-8 text-[#37474F]" />
                                            )}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <h3 className={`${THEME.typography.titleLarge} text-[#263238] ${!template.isActive && 'opacity-50'}`}>
                                                {template.name}
                                            </h3>
                                            <div className={`mt-1 flex flex-wrap gap-1 items-center ${!template.isActive && 'opacity-50'}`}>
                                                {template.assignedTo.length === 0 ? (
                                                    <span className={`${THEME.typography.bodyMedium} text-[#37474F]`}>Unassigned</span>
                                                ) : (
                                                    template.assignedTo.map(empId => (
                                                        <span key={empId} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#B3E5FC] text-[#01579B] rounded-full text-xs font-medium">
                                                            {getEmployeeName(empId)}
                                                            <button
                                                                onClick={() => handleRemoveAssigneeFromTemplate(template.id, template.assignedTo, empId)}
                                                                className="ml-0.5 hover:text-[#B71C1C] transition-colors"
                                                                title={`Remove ${getEmployeeName(empId)}`}
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))
                                                )}
                                                {/* Add employee button */}
                                                {employees.filter(e => !template.assignedTo.includes(e.id)).length > 0 && (
                                                    addingToTemplate === template.id ? (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <select
                                                                value={addingEmployeeSelect}
                                                                onChange={(e) => setAddingEmployeeSelect(e.target.value ? Number(e.target.value) : '')}
                                                                className="h-8 px-2 text-xs border border-[#0277BD] rounded-lg outline-none text-[#263238]"
                                                                autoFocus
                                                            >
                                                                <option value="">Select...</option>
                                                                {employees.filter(e => !template.assignedTo.includes(e.id)).map(emp => (
                                                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                                                ))}
                                                            </select>
                                                            <button
                                                                onClick={() => handleAddAssigneeToTemplate(template.id, template.assignedTo)}
                                                                className="p-1 text-[#0277BD] hover:bg-[#B3E5FC] rounded-full transition-colors"
                                                                title="Confirm"
                                                            >
                                                                <Check className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => { setAddingToTemplate(null); setAddingEmployeeSelect(''); }}
                                                                className="p-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                                                                title="Cancel"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setAddingToTemplate(template.id); setAddingEmployeeSelect(''); }}
                                                            className="inline-flex items-center gap-0.5 px-2 py-1 border border-dashed border-[#0277BD] text-[#0277BD] rounded-full text-xs hover:bg-[#B3E5FC]/30 transition-colors"
                                                            title="Add employee"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                            Add
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                template.isActive
                                                    ? 'bg-[#B2DFDB] text-[#004D40]'
                                                    : 'bg-[#E0E0E0] text-[#37474F]'
                                            }`}>
                                                {template.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <button
                                                onClick={() => onDeleteTemplate(template.id)}
                                                className={`text-[#D32F2F] bg-[#FFCDD2]/10 hover:bg-[#FFCDD2]/30 ${THEME.shapes.full} p-2 transition-colors`}
                                                title="Delete Template"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
