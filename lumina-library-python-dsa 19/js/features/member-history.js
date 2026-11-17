/* MEMBER LIFETIME BORROWING HISTORY FEATURE MODULE */
LuminaLibrary.prototype.renderMemberHistory = function() {
  const allTransactions = this.transactionList.toArray();
  return `
    <div class="page-title-row">
      <div>
        <h1 class="page-heading">Member Lifetime History Ledger</h1>
        <p class="page-subtext">Complete patron borrowing record, active loans, returned volumes, and fine status</p>
      </div>
      <div>
        <select id="member-history-filter" onchange="app.filterMemberHistory(this.value)" style="padding:8px 14px; border:1px solid var(--border-strong); border-radius:var(--radius-sm); font-family:var(--font-main);">
          <option value="ALL">All Patrons</option>
          ${this.members.map(m => `<option value="${m.memberID}">${m.name} (${m.memberID})</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="content-card">
      <table class="custom-table" id="member-history-table">
        <thead>
          <tr>
            <th>Loan ID</th>
            <th>Patron Name</th>
            <th>Member ID</th>
            <th>Book Title</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th>Return Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${allTransactions.map(t => {
            const isLate = t.status === "ISSUED" && this.calculateOverdueDays(t.dueDate) > 0;
            return `
              <tr data-member="${t.memberID}">
                <td><code>${t.transactionID}</code></td>
                <td><strong>${t.memberName}</strong></td>
                <td>${t.memberID}</td>
                <td><strong>${t.bookTitle}</strong> (ID: #${t.bookID})</td>
                <td>${t.issueDate}</td>
                <td>${t.dueDate}</td>
                <td>${t.returnDate ? `<span style="color:var(--success); font-weight:700;">${t.returnDate}</span>` : '<span style="color:var(--warning); font-weight:700;">Active Loan</span>'}</td>
                <td>
                  ${t.status === 'RETURNED' ? `<span class="badge badge-success">RETURNED</span>` : 
                    (isLate ? `<span class="badge badge-danger">OVERDUE</span>` : `<span class="badge badge-warning">ON LOAN</span>`)}
                </td>
              </tr>
            `;
          }).join('') || `<tr><td colspan="8" style="text-align:center;">No member records found.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
};

LuminaLibrary.prototype.filterMemberHistory = function(memberID) {
  const rows = document.querySelectorAll("#member-history-table tbody tr");
  rows.forEach(r => {
    r.style.display = (memberID === "ALL" || r.getAttribute("data-member") === memberID) ? "" : "none";
  });
};

LuminaLibrary.prototype.showSingleMemberHistory = function(memberID) {
  this.navigate('member-history');
  setTimeout(() => {
    const sel = document.getElementById("member-history-filter");
    if (sel) { sel.value = memberID; this.filterMemberHistory(memberID); }
  }, 50);
};
