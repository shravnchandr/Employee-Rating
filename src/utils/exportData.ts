import * as XLSX from 'xlsx';
import type { Employee, Rating, Rule, RuleViolation, DailyTask, TaskIncompleteReport, MonthlyLeaveRecord } from '../types';

interface DateRange {
    startDate: string | null;  // ISO date string (YYYY-MM-DD)
    endDate: string | null;    // ISO date string (YYYY-MM-DD)
}

interface ExportData {
    employees: Employee[];
    ratings: Rating[];
    rules: Rule[];
    violations: RuleViolation[];
    dailyTasks: DailyTask[];
    taskIncompleteReports: TaskIncompleteReport[];
    monthlyLeaves: MonthlyLeaveRecord[];
    categories: string[];
    dateRange?: DateRange;
}

const isWithinDateRange = (dateStr: string, range: DateRange): boolean => {
    const date = new Date(dateStr).setHours(0, 0, 0, 0);
    if (range.startDate) {
        const start = new Date(range.startDate).setHours(0, 0, 0, 0);
        if (date < start) return false;
    }
    if (range.endDate) {
        const end = new Date(range.endDate).setHours(23, 59, 59, 999);
        if (date > end) return false;
    }
    return true;
};

const isMonthWithinRange = (monthStr: string, range: DateRange): boolean => {
    // monthStr format: "YYYY-MM"
    const [year, month] = monthStr.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0); // Last day of month

    if (range.startDate) {
        const start = new Date(range.startDate);
        if (monthEnd < start) return false;
    }
    if (range.endDate) {
        const end = new Date(range.endDate);
        if (monthStart > end) return false;
    }
    return true;
};

export const exportToExcel = (data: ExportData) => {
    const workbook = XLSX.utils.book_new();
    const {
        employees,
        ratings: allRatings,
        rules,
        violations: allViolations,
        dailyTasks: allDailyTasks,
        taskIncompleteReports: allTaskIncompleteReports,
        monthlyLeaves: allMonthlyLeaves,
        categories,
        dateRange
    } = data;

    // Apply date range filter if provided
    const hasDateRange = dateRange && (dateRange.startDate || dateRange.endDate);
    const ratings = hasDateRange
        ? allRatings.filter(r => isWithinDateRange(r.timestamp, dateRange))
        : allRatings;
    const violations = hasDateRange
        ? allViolations.filter(v => isWithinDateRange(v.date, dateRange))
        : allViolations;
    const dailyTasks = hasDateRange
        ? allDailyTasks.filter(t => isWithinDateRange(t.date, dateRange))
        : allDailyTasks;
    const taskIncompleteReports = hasDateRange
        ? allTaskIncompleteReports.filter(r => isWithinDateRange(r.date, dateRange))
        : allTaskIncompleteReports;
    const monthlyLeaves = hasDateRange
        ? allMonthlyLeaves.filter(l => isMonthWithinRange(l.month, dateRange))
        : allMonthlyLeaves;

    // Helper functions
    const getEmployeeName = (id: number) => employees.find(e => e.id === id)?.name || 'Unknown';
    const getRuleName = (id: number) => rules.find(r => r.id === id)?.name || 'Unknown Rule';
    const getTaskName = (id: number) => dailyTasks.find(t => t.id === id)?.name || 'Unknown Task';

    // 1. Summary Sheet
    const dateRangeText = hasDateRange
        ? `${dateRange.startDate || 'Beginning'} to ${dateRange.endDate || 'Present'}`
        : 'All Time';
    const summaryData = [
        ['Employee Rating System - Data Export'],
        ['Generated:', new Date().toLocaleString()],
        ['Date Range:', dateRangeText],
        [''],
        ['Summary Statistics'],
        ['Total Employees:', employees.length],
        ['Total Ratings:', ratings.length],
        ['Total Rules:', rules.length],
        ['Active Rules:', rules.filter(r => r.isActive).length],
        ['Total Violations:', violations.length],
        ['Total Task Reports:', taskIncompleteReports.length],
        ['Total Leave Records:', monthlyLeaves.length],
        [''],
        ['Rating Categories:', categories.join(', ')]
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 25 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // 2. Employees Sheet
    const employeesData = employees.map(emp => ({
        'ID': emp.id,
        'Name': emp.name,
        'Leaves/Month': emp.leavesPerMonth ?? 3,
        'Has Photo': emp.photo ? 'Yes' : 'No',
        'Total Ratings Received': ratings.filter(r => r.ratedEmployeeId === emp.id).length,
        'Total Violations': violations.filter(v => v.employeeId === emp.id).length,
        'Incomplete Task Reports': taskIncompleteReports.filter(r => r.employeeId === emp.id).length
    }));
    if (employeesData.length > 0) {
        const employeesSheet = XLSX.utils.json_to_sheet(employeesData);
        XLSX.utils.book_append_sheet(workbook, employeesSheet, 'Employees');
    }

    // 3. All Ratings Sheet
    const ratingsData = ratings.map(r => ({
        'Date': new Date(r.timestamp).toLocaleDateString(),
        'Time': new Date(r.timestamp).toLocaleTimeString(),
        'Rated Employee': getEmployeeName(r.ratedEmployeeId),
        'Category': r.category,
        'Rating': r.rating,
        'Rater': r.raterName,
        'Is Admin Rating': r.isAdminRating ? 'Yes' : 'No',
        'Feedback': r.feedback || ''
    }));
    if (ratingsData.length > 0) {
        const ratingsSheet = XLSX.utils.json_to_sheet(ratingsData);
        XLSX.utils.book_append_sheet(workbook, ratingsSheet, 'All Ratings');
    }

    // 4. Rule Violations Sheet
    const violationsData = violations.map(v => ({
        'Date': v.date,
        'Time': new Date(v.timestamp).toLocaleTimeString(),
        'Employee': getEmployeeName(v.employeeId),
        'Rule Violated': getRuleName(v.ruleId),
        'Reported By': v.reporterName || 'Unknown',
        'Notes': v.notes || ''
    }));
    if (violationsData.length > 0) {
        const violationsSheet = XLSX.utils.json_to_sheet(violationsData);
        XLSX.utils.book_append_sheet(workbook, violationsSheet, 'Violations');
    }

    // 5. Task Incomplete Reports Sheet
    const taskReportsData = taskIncompleteReports.map(r => ({
        'Date': r.date,
        'Time': new Date(r.timestamp).toLocaleTimeString(),
        'Employee': getEmployeeName(r.employeeId),
        'Task': getTaskName(r.taskId),
        'Reported By': r.reporterName
    }));
    if (taskReportsData.length > 0) {
        const taskReportsSheet = XLSX.utils.json_to_sheet(taskReportsData);
        XLSX.utils.book_append_sheet(workbook, taskReportsSheet, 'Task Reports');
    }

    // 6. Leave Records Sheet
    const leaveData = monthlyLeaves.map(l => ({
        'Month': l.month,
        'Employee': getEmployeeName(l.employeeId),
        'Allocated Leaves': l.allocatedLeaves,
        'Leaves Taken': l.leavesTaken,
        'Remaining': l.allocatedLeaves - l.leavesTaken,
        'Leave Dates': l.leaveDates?.join(', ') || '',
        'Notes': l.notes || ''
    }));
    if (leaveData.length > 0) {
        const leaveSheet = XLSX.utils.json_to_sheet(leaveData);
        XLSX.utils.book_append_sheet(workbook, leaveSheet, 'Leave Records');
    }

    // 7. Rules Sheet
    const rulesData = rules.map(r => ({
        'Rule Name': r.name,
        'Status': r.isActive ? 'Active' : 'Inactive',
        'Total Violations': violations.filter(v => v.ruleId === r.id).length
    }));
    if (rulesData.length > 0) {
        const rulesSheet = XLSX.utils.json_to_sheet(rulesData);
        XLSX.utils.book_append_sheet(workbook, rulesSheet, 'Rules');
    }

    // 8. Individual Employee Sheets
    employees.forEach(emp => {
        const sheetData: (string | number)[][] = [];

        // Employee Header
        sheetData.push(['Employee Report: ' + emp.name]);
        sheetData.push(['Generated:', new Date().toLocaleString()]);
        sheetData.push(['']);

        // Employee Info
        sheetData.push(['Employee Information']);
        sheetData.push(['Name:', emp.name]);
        sheetData.push(['Default Leaves/Month:', emp.leavesPerMonth ?? 3]);
        sheetData.push(['']);

        // Ratings Summary
        const empRatings = ratings.filter(r => r.ratedEmployeeId === emp.id);
        sheetData.push(['Ratings Summary']);
        sheetData.push(['Total Ratings Received:', empRatings.length]);

        // Calculate average per category
        categories.forEach(cat => {
            const catRatings = empRatings.filter(r => r.category === cat);
            const excellent = catRatings.filter(r => r.rating === 'Excellent').length;
            const good = catRatings.filter(r => r.rating === 'Good').length;
            const needsWork = catRatings.filter(r => r.rating === 'Needs Improvement').length;
            if (catRatings.length > 0) {
                sheetData.push([`  ${cat}:`, `Excellent: ${excellent}, Good: ${good}, Needs Work: ${needsWork}`]);
            }
        });
        sheetData.push(['']);

        // Violations
        const empViolations = violations.filter(v => v.employeeId === emp.id);
        sheetData.push(['Violations']);
        sheetData.push(['Total Violations:', empViolations.length]);
        if (empViolations.length > 0) {
            sheetData.push(['Date', 'Rule', 'Reported By']);
            empViolations.forEach(v => {
                sheetData.push([v.date, getRuleName(v.ruleId), v.reporterName || 'Unknown']);
            });
        }
        sheetData.push(['']);

        // Task Reports
        const empTaskReports = taskIncompleteReports.filter(r => r.employeeId === emp.id);
        sheetData.push(['Incomplete Task Reports']);
        sheetData.push(['Total Reports:', empTaskReports.length]);
        if (empTaskReports.length > 0) {
            sheetData.push(['Date', 'Task', 'Reported By']);
            empTaskReports.forEach(r => {
                sheetData.push([r.date, getTaskName(r.taskId), r.reporterName]);
            });
        }
        sheetData.push(['']);

        // Leave Records
        const empLeaves = monthlyLeaves.filter(l => l.employeeId === emp.id);
        sheetData.push(['Leave Records']);
        if (empLeaves.length > 0) {
            sheetData.push(['Month', 'Allocated', 'Taken', 'Remaining']);
            empLeaves.forEach(l => {
                sheetData.push([l.month, l.allocatedLeaves, l.leavesTaken, l.allocatedLeaves - l.leavesTaken]);
            });
        } else {
            sheetData.push(['No leave records found']);
        }

        // Create sheet for this employee
        const empSheet = XLSX.utils.aoa_to_sheet(sheetData);
        empSheet['!cols'] = [{ wch: 25 }, { wch: 50 }];

        // Sanitize sheet name (max 31 chars, no special chars)
        const sheetName = emp.name.slice(0, 28).replace(/[*?:/\\[\]]/g, '');
        XLSX.utils.book_append_sheet(workbook, empSheet, sheetName);
    });

    // Generate filename with date (include range if specified)
    const date = new Date().toISOString().split('T')[0];
    const rangeStr = hasDateRange
        ? `-${dateRange.startDate || 'start'}-to-${dateRange.endDate || 'end'}`
        : '';
    const filename = `employee-data-export-${date}${rangeStr}.xlsx`;

    // Write and download
    XLSX.writeFile(workbook, filename);
};
