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

function buildSummaryDoc(
    employee: Employee,
    scores: PrintScoreData,
    ratings: Rating[],
    monthlyLeaves: MonthlyLeaveRecord[],
    _settings: AppSettings
): string {
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
            ? (catAdmin.reduce((s, r) => s + (values[r.rating] || 0), 0) / catAdmin.length).toFixed(2) : '–';
        const peerAvg = catPeer.length > 0
            ? (catPeer.reduce((s, r) => s + (values[r.rating] || 0), 0) / catPeer.length).toFixed(2) : '–';
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
    const attendanceLabel = attendanceScore >= 3 ? 'Excellent' : attendanceScore >= 2 ? 'Good' : 'Needs Improvement';

    const avatarHtml = employee.photo
        ? `<img style="width:80px;height:80px;border-radius:50%;object-fit:cover;flex-shrink:0;" src="${employee.photo}" alt="${escapeHtml(employee.name)}" />`
        : `<div style="width:80px;height:80px;border-radius:50%;background:#0277BD;display:inline-flex;align-items:center;justify-content:center;color:white;font-size:30px;font-weight:bold;flex-shrink:0;">${escapeHtml(employee.name.charAt(0).toUpperCase())}</div>`;

    const doc = [
        '<!DOCTYPE html><html><head><meta charset="UTF-8">',
        '<title>Performance Summary</title>',
        '<style>',
        '* { box-sizing:border-box; }',
        'body { font-family:Arial,sans-serif; max-width:800px; margin:0 auto; padding:24px; color:#263238; }',
        '.hdr { display:flex; align-items:center; gap:20px; margin-bottom:28px; border-bottom:3px solid #0277BD; padding-bottom:20px; }',
        '.name { font-size:26px; font-weight:bold; margin:0; }',
        '.sub { color:#546E7A; font-size:14px; margin:4px 0 0; }',
        '.sec { margin-bottom:24px; }',
        '.sec h2 { font-size:14px; font-weight:bold; color:#0277BD; text-transform:uppercase; letter-spacing:0.5px; border-bottom:1px solid #CFE9F3; padding-bottom:6px; margin-bottom:14px; }',
        '.grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }',
        '.card { background:#F1F8FB; border:1px solid #CFE9F3; border-radius:10px; padding:14px; }',
        '.card .lbl { font-size:12px; color:#546E7A; margin-bottom:4px; }',
        '.card .val { font-size:24px; font-weight:bold; color:#263238; }',
        '.card .note { font-size:11px; color:#37474F; margin-top:2px; }',
        'table { width:100%; border-collapse:collapse; font-size:13px; }',
        'th { background:#E3F2FD; color:#0277BD; font-weight:bold; text-align:left; padding:8px 12px; border:1px solid #CFE9F3; }',
        'td { padding:8px 12px; border:1px solid #E0E0E0; }',
        'tr:nth-child(even) td { background:#FAFAFA; }',
        '.footer { text-align:center; color:#546E7A; font-size:12px; margin-top:30px; padding-top:12px; border-top:1px solid #E0E0E0; }',
        '@media print { body { padding:10px; } }',
        '</style></head><body>',

        `<div class="hdr">${avatarHtml}<div>`,
        `<p class="name">${escapeHtml(employee.name)}</p>`,
        `<p class="sub">Janhavi Medicals &bull; Performance Summary</p>`,
        `<p class="sub">Generated: ${today}</p>`,
        '</div></div>',

        '<div class="sec"><h2>Overall Scores</h2><div class="grid">',
        `<div class="card"><div class="lbl">Weighted Score</div><div class="val">${scores.weighted} / 3</div><div class="note">Combined performance score</div></div>`,
        `<div class="card"><div class="lbl">Attendance Score (50% weight)</div><div class="val">${scores.attendance} / 3</div><div class="note">${attendanceRate}% attendance &bull; ${attendanceLabel}</div></div>`,
        `<div class="card"><div class="lbl">Admin Rating (30% weight)</div><div class="val">${scores.hasAdminRating ? scores.admin + ' / 3' : 'No data'}</div><div class="note">${adminRatings.length} rating entries</div></div>`,
        `<div class="card"><div class="lbl">Peer Rating (20% weight)</div><div class="val">${scores.hasPeerRating ? scores.peer + ' / 3' : 'No data'}</div><div class="note">${peerRatings.length} rating entries</div></div>`,
        '</div></div>',

        ...(categories.length > 0 ? [
            '<div class="sec"><h2>Ratings by Category</h2><table>',
            '<thead><tr><th>Category</th><th>Admin Average (1-3)</th><th>Peer Average (1-3)</th></tr></thead>',
            `<tbody>${categoryRows}</tbody></table></div>`
        ] : []),

        '<div class="sec"><h2>Attendance Summary</h2><table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>',
        `<tr><td>Total Leaves Allocated</td><td>${totalLeavesAllocated} days</td></tr>`,
        `<tr><td>Total Leaves Taken</td><td>${totalLeavesTaken} days</td></tr>`,
        `<tr><td>Attendance Rate</td><td>${attendanceRate}%</td></tr>`,
        `<tr><td>Attendance Score</td><td>${scores.attendance} / 3 (${attendanceLabel})</td></tr>`,
        '</tbody></table></div>',

        ...(recentFeedback.length > 0 ? [
            '<div class="sec"><h2>Recent Feedback</h2><table>',
            '<thead><tr><th>From</th><th>Date</th><th>Feedback</th></tr></thead>',
            `<tbody>${feedbackRows}</tbody></table></div>`
        ] : []),

        `<div class="footer">Janhavi Medicals &bull; Employee Performance Report &bull; ${today}</div>`,
        '</body></html>'
    ].join('');

    return doc;
}

function printViaIframe(doc: string) {
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;border:none;';
    frame.setAttribute('srcdoc', doc);
    document.body.appendChild(frame);
    frame.addEventListener('load', () => {
        frame.contentWindow?.print();
        setTimeout(() => {
            if (document.body.contains(frame)) document.body.removeChild(frame);
        }, 1000);
    });
}

export function printEmployeeSummary(
    employee: Employee,
    scores: PrintScoreData,
    ratings: Rating[],
    monthlyLeaves: MonthlyLeaveRecord[],
    settings: AppSettings
) {
    printViaIframe(buildSummaryDoc(employee, scores, ratings, monthlyLeaves, settings));
}

export async function saveEmployeeSummaryAsPDF(
    employee: Employee,
    scores: PrintScoreData,
    ratings: Rating[],
    monthlyLeaves: MonthlyLeaveRecord[],
    settings: AppSettings
) {
    const doc = buildSummaryDoc(employee, scores, ratings, monthlyLeaves, settings);
    const filename = employee.name.replace(/[^a-z0-9]/gi, '_') + '_Performance_Summary';

    if (window.electronAPI?.savePDF) {
        await window.electronAPI.savePDF(doc, filename);
    } else {
        // Browser fallback: print dialog lets user choose "Save as PDF"
        printViaIframe(doc);
    }
}
