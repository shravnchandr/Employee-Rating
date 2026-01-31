export interface Employee {
    id: number;
    name: string;
    photo: string | null;
    avatar: string;
    leavesPerMonth: number;  // Default leave allocation per month
    isArchived?: boolean;    // Soft delete - archived employees are hidden but data preserved
}

export interface Rating {
    id: number;
    raterId: number | 'admin';
    raterName: string;
    isAdminRating: boolean;
    ratedEmployeeId: number;
    category: string;
    rating: string;
    feedback?: string;
    timestamp: string;
}

export interface TaskTemplate {
    id: number;
    name: string;
    description?: string;
    assignedTo: number | null; // employee id or null for unassigned
    isActive: boolean;
}

export interface DailyTask {
    id: number;
    templateId: number | null; // null if ad-hoc task
    name: string;
    description?: string;
    assignedTo: number;
    date: string; // ISO date string (YYYY-MM-DD)
    completed: boolean;
    completedAt?: string;
}

export interface Rule {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
}

export interface RuleViolation {
    id: number;
    employeeId: number;
    ruleId: number;
    date: string; // ISO date string (YYYY-MM-DD)
    reportedBy: number | 'admin';  // Employee ID or 'admin' who reported
    reporterName: string;
    notes?: string;
    timestamp: string;
}

export interface TaskIncompleteReport {
    id: number;
    taskId: number;
    employeeId: number;  // Employee whose task is reported incomplete
    reportedBy: number;  // Employee ID who reported (peers only, not admin)
    reporterName: string;
    date: string; // ISO date string (YYYY-MM-DD)
    timestamp: string;
}

export interface MonthlyLeaveRecord {
    id: number;
    employeeId: number;
    month: string;              // Format: "YYYY-MM"
    allocatedLeaves: number;    // Allows override of employee default for this month
    leavesTaken: number;        // Count of leaves taken
    leaveDates?: string[];      // Optional: specific dates (YYYY-MM-DD format)
    notes?: string;
}
