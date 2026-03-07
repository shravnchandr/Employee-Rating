import type { Employee, Rating, MonthlyLeaveRecord, AppSettings } from '../types';

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export interface PrintScoreData {
    weighted: string | number;
    admin: string | number;
    peer: string | number;
    attendance: string | number;
    hasAdminRating: boolean;
    hasPeerRating: boolean;
    hasAttendance: boolean;
}

export function printEmployeeSummary(
    employee: Employee,
    scores: PrintScoreData,
    ratings: Rating[],
    monthlyLeaves: MonthlyLeaveRecord[],
    _settings: AppSettings
) {
    const employeeRatings = ratings.filter(r => r.ratedEmployeeId === employee.id);
    const adminRatings = employeeRatings.filter(r => r.isAdminRating);
    const peerRatings = employeeRatings.filter(r => !r.isAdminRating);

    const empLeaves = monthlyLeaves.filter(l => l.employeeId === employee.id);
    const totalLeavesTaken = empLeaves.reduce((sum, l) => sum + (l.leavesTaken || 0), 0);
    const totalLeavesAllocated = empLeaves.reduce((sum, l) => sum + (l.allocatedLeaves || 0), 0);
    const attendanceRate = totalLeavesAllocated > 0
        ? Math.round(((totalLeavesAllocated - totalLeavesTaken) / totalLeavesAllocated) * 100)
        : 100;

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const categories = Array.from(new Set(employeeRatings.map(r => r.category)));
    const values: Record<string, number> = { 'Needs Improvement': 1, 'Good': 2, 'Excellent': 3 };

    const categoryRows = categories.map(cat => {
        const catAdmin = adminRatings.filter(r => r.category === cat);
        const catPeer = peerRatings.filter(r => r.category === cat);
        const adminAvg = catAdmin.length > 0
            ? (catAdmin.reduce((s, r) => s + (values[r.rating] || 0), 0) / catAdmin.length).toFixed(2)
            : '–';
        const peerAvg = catPeer.length > 0
            ? (catPeer.reduce((s, r) => s + (values[r.rating] || 0), 0) / catPeer.length).toFixed(2)
            : '–';
        return `<tr><td>${escapeHtml(cat)}</td><td>${adminAvg}</td><td>${peerAvg}</td></tr>`;
    }).join('');

    const recentFeedback = [...employeeRatings]
        .filter(r => r.feedback)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

    const feedbackRows = recentFeedback.map(r =>
        `<tr><td>${r.isAdminRating ? 'Admin' : escapeHtml(r.raterName || 'Peer')}</td><td>${new Date(r.timestamp).toLocaleDateString()}</td><td>${escapeHtml(r.feedback || '')}</td></tr>`
    ).join('');

    const attendanceScore = Number(scores.attendance);
    const attendanceLabel = attendanceScore >= 3 ? 'Excellent'
        : attendanceScore >= 2 ? 'Good'
        : 'Needs Improvement';

    const html =`<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>Performance Summary – ${escapeHtml(employee.name)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #263238; }
  .header { display: flex; align-items: center; gap: 20px; margin-bottom: 28px; border-bottom: 3px solid #0277BD; padding-bottom: 20px; }
  .avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
  .avatar-placeholder { width: 80px; height: 80px; border-radius: 50%; background: #0277BD; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 30px; font-weight: bold; flex-shrink: 0; }
  .name { font-size: 26px; font-weight: bold; margin: 0; }
  .subtitle { color: #546E7A; font-size: 14px; margin: 4px 0 0; }
  .section { margin-bottom: 24px; }
  .section h2 { font-size: 14px; font-weight: bold; color: #0277BD; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #CFE9F3; padding-bottom: 6px; margin-bottom: 14px; }
  .score-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .score-card { background: #F1F8FB; border: 1px solid #CFE9F3; border-radius: 10px; padding: 14px; }
  .score-card .label { font-size: 12px; color: #546E7A; margin-bottom: 4px; }
  .score-card .value { font-size: 24px; font-weight: bold; color: #263238; }
  .score-card .sub { font-size: 11px; color: #37474F; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #E3F2FD; color: #0277BD; font-weight: bold; text-align: left; padding: 8px 12px; border: 1px solid #CFE9F3; }
  td { padding: 8px 12px; border: 1px solid #E0E0E0; color: #263238; }
  tr:nth-child(even) td { background: #FAFAFA; }
  .footer { text-align: center; color: #546E7A; font-size: 12px; margin-top: 30px; padding-top: 12px; border-top: 1px solid #E0E0E0; }
  @media print { body { padding: 10px; } }
</style>
</head><body>
<div class="header">
  ${employee.photo
    ? `<img class="avatar" src="${employee.photo}" alt="${escapeHtml(employee.name)}" />`
    : `<div class="avatar-placeholder">${escapeHtml(employee.name.charAt(0).toUpperCase())}</div>`}
  <div>
    <p class="name">${escapeHtml(employee.name)}</p>
    <p class="subtitle">Janhavi Medicals &bull; Performance Summary</p>
    <p class="subtitle">Generated: ${today}</p>
  </div>
</div>

<div class="section">
  <h2>Overall Scores</h2>
  <div class="score-grid">
    <div class="score-card">
      <div class="label">Weighted Score</div>
      <div class="value">${scores.weighted} / 3</div>
      <div class="sub">Combined performance score</div>
    </div>
    <div class="score-card">
      <div class="label">Attendance Score (50% weight)</div>
      <div class="value">${scores.attendance} / 3</div>
      <div class="sub">${attendanceRate}% attendance &bull; ${attendanceLabel}</div>
    </div>
    <div class="score-card">
      <div class="label">Admin Rating (30% weight)</div>
      <div class="value">${scores.hasAdminRating ? scores.admin + ' / 3' : 'No data'}</div>
      <div class="sub">${adminRatings.length} rating entries</div>
    </div>
    <div class="score-card">
      <div class="label">Peer Rating (20% weight)</div>
      <div class="value">${scores.hasPeerRating ? scores.peer + ' / 3' : 'No data'}</div>
      <div class="sub">${peerRatings.length} rating entries</div>
    </div>
  </div>
</div>

${categories.length > 0 ? `<div class="section">
  <h2>Ratings by Category</h2>
  <table>
    <thead><tr><th>Category</th><th>Admin Average (1–3)</th><th>Peer Average (1–3)</th></tr></thead>
    <tbody>${categoryRows}</tbody>
  </table>
</div>` : ''}

<div class="section">
  <h2>Attendance Summary</h2>
  <table>
    <thead><tr><th>Metric</th><th>Value</th></tr></thead>
    <tbody>
      <tr><td>Total Leaves Allocated</td><td>${totalLeavesAllocated} days</td></tr>
      <tr><td>Total Leaves Taken</td><td>${totalLeavesTaken} days</td></tr>
      <tr><td>Attendance Rate</td><td>${attendanceRate}%</td></tr>
      <tr><td>Attendance Score</td><td>${scores.attendance} / 3 (${attendanceLabel})</td></tr>
    </tbody>
  </table>
</div>

${recentFeedback.length > 0 ? `<div class="section">
  <h2>Recent Feedback</h2>
  <table>
    <thead><tr><th>From</th><th>Date</th><th>Feedback</th></tr></thead>
    <tbody>${feedbackRows}</tbody>
  </table>
</div>` : ''}

<div class="footer">
  Janhavi Medicals &bull; Employee Performance Report &bull; ${today}
</div>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank', 'width=850,height=900');
    if (win) {
        win.onload = () => {
            setTimeout(() => {
                win.print();
                URL.revokeObjectURL(url);
            }, 300);
        };
    } else {
        URL.revokeObjectURL(url);
    }
}
