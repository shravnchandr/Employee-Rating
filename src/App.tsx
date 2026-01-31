import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Employee, Rating, TaskTemplate, DailyTask, Rule, RuleViolation, MonthlyLeaveRecord, TaskIncompleteReport } from './types';
import { LoginView } from './components/auth/LoginView';
import { AdminSelectionView } from './components/admin/AdminSelectionView';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { EmployeeManagement } from './components/employees/EmployeeManagement';
import { DailyTasksDashboard } from './components/tasks/DailyTasksDashboard';
import { RulesCompliance } from './components/rules/RulesCompliance';
import { LeaveTracker } from './components/attendance/LeaveTracker';
import { RatingView } from './components/rating/RatingView';
import { DataManagement } from './components/data/DataManagement';
import { api } from './services/api';
import { exportToExcel } from './utils/exportData';
import { hashPassword, verifyPassword } from './utils/password';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const EmployeeRatingApp = () => {
  const [view, setView] = useState('login');
  const [adminPassword, setAdminPassword] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [categories, setCategories] = useState<string[]>(['Teamwork', 'Communication', 'Quality of Work', 'Reliability']);
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [violations, setViolations] = useState<RuleViolation[]>([]);
  const [monthlyLeaves, setMonthlyLeaves] = useState<MonthlyLeaveRecord[]>([]);
  const [taskIncompleteReports, setTaskIncompleteReports] = useState<TaskIncompleteReport[]>([]);
  const [storedAdminPassword, setStoredAdminPassword] = useState<string>('admin123');

  // Admin states
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeePhoto, setNewEmployeePhoto] = useState('');
  const [newEmployeeLeavesPerMonth, setNewEmployeeLeavesPerMonth] = useState(3);

  // Employee rating states
  const [currentRater, setCurrentRater] = useState<Employee | null>(null);
  const [isAdminRating, setIsAdminRating] = useState(false);
  const [currentRatingIndex, setCurrentRatingIndex] = useState(0);
  const [currentRatings, setCurrentRatings] = useState<Record<number, Record<string, string>>>({});
  const [currentFeedbacks, setCurrentFeedbacks] = useState<Record<number, string>>({});
  const [currentViolations, setCurrentViolations] = useState<Record<number, number[]>>({}); // employeeId -> ruleIds
  const [currentIncompleteTasks, setCurrentIncompleteTasks] = useState<Record<number, number[]>>({}); // employeeId -> taskIds

  // Animations & UI States
  const [animating, setAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Security states
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const sessionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // New Views State
  const [viewTrendsFor, setViewTrendsFor] = useState<number | null>(null);
  const [viewHistoryFor, setViewHistoryFor] = useState<number | null>(null);

  // Filter out archived employees for active views
  const activeEmployees = employees.filter(e => !e.isArchived);
  const archivedEmployees = employees.filter(e => e.isArchived);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.fetchData();
      if (data.employees) setEmployees(data.employees);
      if (data.ratings) setRatings(data.ratings);
      if (data.categories) setCategories(data.categories);
      if (data.taskTemplates) setTaskTemplates(data.taskTemplates);
      if (data.dailyTasks) setDailyTasks(data.dailyTasks);
      if (data.rules) setRules(data.rules);
      if (data.violations) setViolations(data.violations);
      if (data.monthlyLeaves) setMonthlyLeaves(data.monthlyLeaves);
      if (data.taskIncompleteReports) setTaskIncompleteReports(data.taskIncompleteReports);
      if (data.adminPassword) setStoredAdminPassword(data.adminPassword);
    } catch (error) {
      console.log('Error loading data:', error);
    } finally {
      setIsDataLoaded(true);
    }
  };

  const saveData = async () => {
    try {
      await api.saveData({
        employees,
        ratings,
        categories,
        taskTemplates,
        dailyTasks,
        rules,
        violations,
        monthlyLeaves,
        taskIncompleteReports,
        adminPassword: storedAdminPassword
      });
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  useEffect(() => {
    // Only save after initial data load is complete to prevent overwriting with empty state
    if (isDataLoaded) {
      saveData();
    }
  }, [employees, ratings, categories, taskTemplates, dailyTasks, rules, violations, monthlyLeaves, taskIncompleteReports, storedAdminPassword, isDataLoaded]);

  // Auto-populate daily tasks from active templates
  useEffect(() => {
    if (!isDataLoaded) return;

    const today = new Date().toISOString().split('T')[0];
    const todaysTasks = dailyTasks.filter(t => t.date === today);

    // Get active templates that don't have tasks created for today
    const activeTemplates = taskTemplates.filter(t => t.isActive && t.assignedTo);
    const newTasks: DailyTask[] = [];

    activeTemplates.forEach(template => {
      const existingTask = todaysTasks.find(
        t => t.templateId === template.id && t.assignedTo === template.assignedTo
      );

      if (!existingTask && template.assignedTo) {
        newTasks.push({
          id: Date.now() + Math.floor(Math.random() * 10000),
          templateId: template.id,
          name: template.name,
          description: template.description,
          assignedTo: template.assignedTo,
          date: today,
          completed: false
        });
      }
    });

    if (newTasks.length > 0) {
      setDailyTasks(prev => [...prev, ...newTasks]);
    }
  }, [taskTemplates, isDataLoaded]);

  // Session timeout management
  const resetSessionTimeout = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    if (view !== 'login') {
      sessionTimeoutRef.current = setTimeout(() => {
        setView('login');
        alert('Session expired due to inactivity. Please log in again.');
      }, SESSION_TIMEOUT_MS);
    }
  }, [view]);

  // Reset session timeout on user activity
  useEffect(() => {
    const handleActivity = () => resetSessionTimeout();
    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);
    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, [resetSessionTimeout]);

  const handleAdminLogin = async () => {
    // Check for lockout
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
      alert(`Too many failed attempts. Please wait ${remainingSeconds} seconds.`);
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await verifyPassword(adminPassword, storedAdminPassword);
      if (isValid) {
        setView('adminSelection');
        setAdminPassword('');
        setLoginAttempts(0);
        setLockoutUntil(null);
        resetSessionTimeout();
      } else {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          setLockoutUntil(Date.now() + LOCKOUT_DURATION_MS);
          alert(`Too many failed attempts. Locked out for 5 minutes.`);
        } else {
          alert(`Incorrect password. ${MAX_LOGIN_ATTEMPTS - newAttempts} attempts remaining.`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (newPassword: string) => {
    setIsLoading(true);
    try {
      const hashedPassword = await hashPassword(newPassword);
      setStoredAdminPassword(hashedPassword);
    } finally {
      setIsLoading(false);
    }
  };

  // Password verification function for child components
  const verifyStoredPassword = useCallback(async (password: string): Promise<boolean> => {
    return verifyPassword(password, storedAdminPassword);
  }, [storedAdminPassword]);

  // Task template handlers
  const addTaskTemplate = (template: Omit<TaskTemplate, 'id'>) => {
    const newTemplate: TaskTemplate = {
      ...template,
      id: Date.now()
    };
    setTaskTemplates(prev => [...prev, newTemplate]);
  };

  const deleteTaskTemplate = (id: number) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTaskTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const toggleTemplateActive = (id: number) => {
    setTaskTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ));
  };

  // Daily task handlers
  const addDailyTask = (task: Omit<DailyTask, 'id'>) => {
    const newTask: DailyTask = {
      ...task,
      id: Date.now()
    };
    setDailyTasks(prev => [...prev, newTask]);
  };

  // Rule handlers
  const addRule = (rule: Omit<Rule, 'id'>) => {
    const newRule: Rule = {
      ...rule,
      id: Date.now()
    };
    setRules(prev => [...prev, newRule]);
  };

  const toggleRuleActive = (id: number) => {
    setRules(prev => prev.map(r =>
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const deleteRule = (id: number) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      setRules(prev => prev.filter(r => r.id !== id));
    }
  };

  // Monthly leave handlers
  const addOrUpdateMonthlyLeave = (record: Omit<MonthlyLeaveRecord, 'id'>) => {
    setMonthlyLeaves(prev => {
      // Check if a record already exists for this employee and month
      const existingIndex = prev.findIndex(
        r => r.employeeId === record.employeeId && r.month === record.month
      );

      if (existingIndex >= 0) {
        // Update existing record
        return prev.map((r, idx) =>
          idx === existingIndex ? { ...r, ...record } : r
        );
      }

      // Create new record
      const newRecord: MonthlyLeaveRecord = {
        ...record,
        id: Date.now() + Math.floor(Math.random() * 10000)
      };
      return [...prev, newRecord];
    });
  };

  const updateEmployeeLeavesPerMonth = (employeeId: number, leaves: number) => {
    setEmployees(prev => prev.map(e =>
      e.id === employeeId ? { ...e, leavesPerMonth: leaves } : e
    ));
  };

  // Category management
  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  const removeCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  // Backup/Restore functions
  const handleBackup = () => {
    const backupData = {
      employees,
      ratings,
      categories,
      taskTemplates,
      dailyTasks,
      rules,
      violations,
      monthlyLeaves,
      taskIncompleteReports,
      adminPassword: storedAdminPassword,
      backupDate: new Date().toISOString(),
      version: '1.2'
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `janhavi-medicals-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestore = (jsonContent: string) => {
    try {
      const data = JSON.parse(jsonContent);
      if (data.employees) setEmployees(data.employees);
      if (data.ratings) setRatings(data.ratings);
      if (data.categories) setCategories(data.categories);
      if (data.taskTemplates) setTaskTemplates(data.taskTemplates);
      if (data.dailyTasks) setDailyTasks(data.dailyTasks);
      if (data.rules) setRules(data.rules);
      if (data.violations) setViolations(data.violations);
      if (data.monthlyLeaves) setMonthlyLeaves(data.monthlyLeaves);
      if (data.taskIncompleteReports) setTaskIncompleteReports(data.taskIncompleteReports);
      if (data.adminPassword) setStoredAdminPassword(data.adminPassword);
    } catch (error) {
      console.error('Error restoring data:', error);
      alert('Failed to restore data. The backup file may be corrupted.');
    }
  };

  const startRatingForEmployee = (employee: Employee) => {
    setCurrentRater(employee);
    setIsAdminRating(false);
    setView('employee');
    setCurrentRatingIndex(0);
    setCurrentRatings({});
    setCurrentFeedbacks({});
    setCurrentViolations({});
    setCurrentIncompleteTasks({});
  };

  const startAdminRating = () => {
    setIsAdminRating(true);
    setView('adminRating');
    setCurrentRatingIndex(0);
    setCurrentRatings({});
    setCurrentFeedbacks({});
    setCurrentViolations({});
    setCurrentIncompleteTasks({});
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => setNewEmployeePhoto(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateAvatar = (name: string) => {
    const colors = ['bg-[#0277BD]', 'bg-[#00897B]', 'bg-[#00ACC1]', 'bg-[#0288D1]', 'bg-[#00796B]'];
    return colors[name.length % colors.length];
  };

  const addEmployee = () => {
    if (newEmployeeName.trim()) {
      const newEmp: Employee = {
        id: Date.now(),
        name: newEmployeeName.trim(),
        photo: newEmployeePhoto || null,
        avatar: generateAvatar(newEmployeeName),
        leavesPerMonth: newEmployeeLeavesPerMonth
      };
      setEmployees([...employees, newEmp]);
      setNewEmployeeName('');
      setNewEmployeePhoto('');
      setNewEmployeeLeavesPerMonth(3);
    }
  };

  const removeEmployee = (id: number) => {
    if (confirm('Are you sure you want to archive this employee? Their data will be preserved but they will be hidden from active views.')) {
      setEmployees(employees.map(e => e.id === id ? { ...e, isArchived: true } : e));
    }
  };

  const restoreEmployee = (id: number) => {
    setEmployees(employees.map(e => e.id === id ? { ...e, isArchived: false } : e));
  };

  const updateEmployee = (id: number, updates: { name?: string; photo?: string | null }) => {
    setEmployees(employees.map(emp => {
      if (emp.id === id) {
        const updatedEmp = { ...emp, ...updates };
        // Update avatar if name changed
        if (updates.name && updates.name !== emp.name) {
          updatedEmp.avatar = generateAvatar(updates.name);
        }
        return updatedEmp;
      }
      return emp;
    }));
  };

  const employeesToRate = isAdminRating ? activeEmployees : activeEmployees.filter(e => e.id !== currentRater?.id);

  const submitCategoryRating = (category: string, value: string) => {
    const employeeToRate = employeesToRate[currentRatingIndex];
    const newRatings = { ...currentRatings };
    if (!newRatings[employeeToRate.id]) newRatings[employeeToRate.id] = {};
    newRatings[employeeToRate.id][category] = value;
    setCurrentRatings(newRatings);
  };

  const submitFeedback = (value: string) => {
    const employeeToRate = employeesToRate[currentRatingIndex];
    setCurrentFeedbacks({
      ...currentFeedbacks,
      [employeeToRate.id]: value
    });
  };

  const toggleViolation = (employeeId: number, ruleId: number) => {
    setCurrentViolations(prev => {
      const current = prev[employeeId] || [];
      const newViolations = current.includes(ruleId)
        ? current.filter(id => id !== ruleId)
        : [...current, ruleId];
      return { ...prev, [employeeId]: newViolations };
    });
  };

  const toggleIncompleteTask = (employeeId: number, taskId: number) => {
    setCurrentIncompleteTasks(prev => {
      const current = prev[employeeId] || [];
      const newTasks = current.includes(taskId)
        ? current.filter(id => id !== taskId)
        : [...current, taskId];
      return { ...prev, [employeeId]: newTasks };
    });
  };

  const goToNextEmployee = () => {
    const employeeToRate = employeesToRate[currentRatingIndex];
    const hasAllRatings = categories.every(cat => currentRatings[employeeToRate.id]?.[cat]);

    if (!hasAllRatings) {
      alert('Please rate all categories before proceeding');
      return;
    }

    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      if (currentRatingIndex < employeesToRate.length - 1) {
        setCurrentRatingIndex(currentRatingIndex + 1);
      } else {
        saveAllRatings(currentRatings);
      }
    }, 300);
  };

  const saveAllRatings = (ratingsToSave: Record<number, Record<string, string>>) => {
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();
    const reporterId = isAdminRating ? 'admin' as const : currentRater!.id;
    const reporterName = isAdminRating ? 'Admin' : currentRater!.name;

    // Save ratings
    const newRatingEntries: Rating[] = [];
    Object.keys(ratingsToSave).forEach(employeeIdStr => {
      const employeeId = parseInt(employeeIdStr);
      Object.keys(ratingsToSave[employeeId]).forEach(category => {
        newRatingEntries.push({
          id: Date.now() + Math.floor(Math.random() * 10000),
          raterId: reporterId,
          raterName: reporterName,
          isAdminRating: isAdminRating,
          ratedEmployeeId: employeeId,
          category: category,
          rating: ratingsToSave[employeeId][category],
          feedback: currentFeedbacks[employeeId],
          timestamp: timestamp
        });
      });
    });

    // Save rule violations (only for peer ratings, not admin)
    const newViolations: RuleViolation[] = [];
    if (!isAdminRating) {
      Object.keys(currentViolations).forEach(employeeIdStr => {
        const employeeId = parseInt(employeeIdStr);
        const ruleIds = currentViolations[employeeId] || [];
        ruleIds.forEach(ruleId => {
          newViolations.push({
            id: Date.now() + Math.floor(Math.random() * 10000),
            employeeId: employeeId,
            ruleId: ruleId,
            date: today,
            reportedBy: currentRater!.id,
            reporterName: currentRater!.name,
            timestamp: timestamp
          });
        });
      });
    }

    // Save task incomplete reports (only for peer ratings, not admin)
    const newTaskReports: TaskIncompleteReport[] = [];
    if (!isAdminRating) {
      Object.keys(currentIncompleteTasks).forEach(employeeIdStr => {
        const employeeId = parseInt(employeeIdStr);
        const taskIds = currentIncompleteTasks[employeeId] || [];
        taskIds.forEach(taskId => {
          newTaskReports.push({
            id: Date.now() + Math.floor(Math.random() * 10000),
            taskId: taskId,
            employeeId: employeeId,
            reportedBy: currentRater!.id,
            reporterName: currentRater!.name,
            date: today,
            timestamp: timestamp
          });
        });
      });
    }

    setRatings([...ratings, ...newRatingEntries]);
    if (newViolations.length > 0) {
      setViolations(prev => [...prev, ...newViolations]);
    }
    if (newTaskReports.length > 0) {
      setTaskIncompleteReports(prev => [...prev, ...newTaskReports]);
    }

    setView('admin');
    setCurrentRater(null);
    setIsAdminRating(false);
    setCurrentRatings({});
    setCurrentFeedbacks({});
    setCurrentViolations({});
    setCurrentIncompleteTasks({});
    setCurrentRatingIndex(0);
  };

  if (view === 'login') {
    return (
      <LoginView
        adminPassword={adminPassword}
        setAdminPassword={setAdminPassword}
        handleAdminLogin={handleAdminLogin}
        isLoading={isLoading}
        lockoutUntil={lockoutUntil}
        attemptsRemaining={MAX_LOGIN_ATTEMPTS - loginAttempts}
      />
    );
  }

  if (view === 'adminSelection') {
    return (
      <AdminSelectionView
        onSelectRatings={() => setView('admin')}
        onSelectTasks={() => setView('tasks')}
        onSelectEmployees={() => setView('employees')}
        onSelectRules={() => setView('rules')}
        onSelectAttendance={() => setView('attendance')}
        onSelectData={() => setView('data')}
        onLogout={() => setView('login')}
        onChangePassword={handleChangePassword}
      />
    );
  }

  if (view === 'data') {
    const handleExport = (dateRange?: { startDate: string | null; endDate: string | null }) => {
      exportToExcel({
        employees,
        ratings,
        rules,
        violations,
        dailyTasks,
        taskIncompleteReports,
        monthlyLeaves,
        categories,
        dateRange
      });
    };

    return (
      <DataManagement
        onExport={handleExport}
        onBackup={handleBackup}
        onRestore={handleRestore}
        onBack={() => setView('adminSelection')}
      />
    );
  }

  if (view === 'employees') {
    return (
      <EmployeeManagement
        employees={activeEmployees}
        archivedEmployees={archivedEmployees}
        newEmployeeName={newEmployeeName}
        setNewEmployeeName={setNewEmployeeName}
        newEmployeePhoto={newEmployeePhoto}
        handlePhotoUpload={handlePhotoUpload}
        newEmployeeLeavesPerMonth={newEmployeeLeavesPerMonth}
        setNewEmployeeLeavesPerMonth={setNewEmployeeLeavesPerMonth}
        addEmployee={addEmployee}
        removeEmployee={removeEmployee}
        restoreEmployee={restoreEmployee}
        updateEmployee={updateEmployee}
        updateEmployeeLeavesPerMonth={updateEmployeeLeavesPerMonth}
        onBack={() => setView('adminSelection')}
      />
    );
  }

  if (view === 'admin') {
    return (
      <AdminDashboard
        employees={activeEmployees}
        ratings={ratings}
        monthlyLeaves={monthlyLeaves}
        verifyPassword={verifyStoredPassword}
        startAdminRating={startAdminRating}
        startRatingForEmployee={startRatingForEmployee}
        onBack={() => setView('adminSelection')}
        viewTrendsFor={viewTrendsFor}
        setViewTrendsFor={setViewTrendsFor}
        viewHistoryFor={viewHistoryFor}
        setViewHistoryFor={setViewHistoryFor}
        categories={categories}
        onAddCategory={addCategory}
        onRemoveCategory={removeCategory}
      />
    );
  }

  if (view === 'tasks') {
    return (
      <DailyTasksDashboard
        employees={activeEmployees}
        taskTemplates={taskTemplates}
        dailyTasks={dailyTasks}
        taskIncompleteReports={taskIncompleteReports}
        onAddTemplate={addTaskTemplate}
        onDeleteTemplate={deleteTaskTemplate}
        onToggleTemplateActive={toggleTemplateActive}
        onAddDailyTask={addDailyTask}
        onBack={() => setView('adminSelection')}
      />
    );
  }

  if (view === 'rules') {
    return (
      <RulesCompliance
        employees={activeEmployees}
        rules={rules}
        violations={violations}
        onAddRule={addRule}
        onToggleRuleActive={toggleRuleActive}
        onDeleteRule={deleteRule}
        onBack={() => setView('adminSelection')}
      />
    );
  }

  if (view === 'attendance') {
    return (
      <LeaveTracker
        employees={activeEmployees}
        monthlyLeaves={monthlyLeaves}
        onAddOrUpdateMonthlyLeave={addOrUpdateMonthlyLeave}
        onUpdateEmployeeLeavesPerMonth={updateEmployeeLeavesPerMonth}
        onBack={() => setView('adminSelection')}
      />
    );
  }

  if (view === 'employee' || view === 'adminRating') {
    const today = new Date().toISOString().split('T')[0];
    const todaysTasks = dailyTasks.filter(t => t.date === today);
    const activeRules = rules.filter(r => r.isActive);

    return (
      <RatingView
        employeesToRate={employeesToRate}
        currentRatingIndex={currentRatingIndex}
        currentRatings={currentRatings}
        categories={categories}
        isAdminRating={isAdminRating}
        animating={animating}
        submitCategoryRating={submitCategoryRating}
        submitFeedback={submitFeedback}
        currentFeedbacks={currentFeedbacks}
        goToNextEmployee={goToNextEmployee}
        onExit={() => setView('admin')}
        rules={activeRules}
        dailyTasks={todaysTasks}
        currentViolations={currentViolations}
        currentIncompleteTasks={currentIncompleteTasks}
        onToggleViolation={toggleViolation}
        onToggleIncompleteTask={toggleIncompleteTask}
      />
    );
  }

  return null;
};

export default EmployeeRatingApp;