/* BOOK CUSTODY & CIRCULATION HISTORY FEATURE MODULE */
LuminaLibrary.prototype.renderBookHistory = function() {
  const allTransactions = this.transactionList.toArray();
  return `
    <div class="page-title-row">
      <div>
        <h1 class="page-heading">Book Custody & History</h1>
        <p class="page-subtext">Track who took each book, checkout timestamp, return timestamp, and current custody status</p>
      </div>
      <div>
        <select id="book-history-filter" onchange="app.filterBookHistory(this.value)" style="padding:8px 14px; border:1px solid var(--border-strong); border-radius:var(--radius-sm); font-family:var(--font-main);">
          <option value="ALL">All 52 Catalog Titles</option>
          ${this.books.map(b => `<option value="${b.bookID}">[#${b.bookID}] ${b.title}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="content-card">
      <table class="custom-table" id="book-history-table">
        <thead>
          <tr>
            <th>Book ID</th>
            <th>Book Title</th>
            <th>Borrower / Patron</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th>Return Date</th>
            <th>Custody Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${allTransactions.map(t => {
            const book = this.findBook(t.bookID);
            const isIssued = t.status === "ISSUED";
            return `
              <tr data-book="${t.bookID}">
                <td><code>#${t.bookID}</code></td>
                <td><strong>${t.bookTitle}</strong></td>
                <td>${t.memberName} (<code>${t.memberID}</code>)</td>
                <td>${t.issueDate}</td>
                <td>${t.dueDate}</td>
                <td>${t.returnDate ? t.returnDate : '—'}</td>
                <td>
                  ${isIssued ? `<span class="badge badge-warning">In Custody of ${t.memberName}</span>` : `<span class="badge badge-success">On Shelf (${book ? book.shelf : 'Desk'})</span>`}
                </td>
                <td>
                  <button class="btn btn-sm" onclick="app.showTransactionTimeline('${t.transactionID}')">Timeline</button>
                </td>
              </tr>
            `;
          }).join('') || `<tr><td colspan="8" style="text-align:center;">No circulation records found.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
};

LuminaLibrary.prototype.filterBookHistory = function(bookID) {
  const rows = document.querySelectorAll("#book-history-table tbody tr");
  rows.forEach(r => {
    r.style.display = (bookID === "ALL" || r.getAttribute("data-book") === bookID) ? "" : "none";
  });
};

LuminaLibrary.prototype.showSingleBookHistory = function(bookID) {
  this.navigate('book-history');
  setTimeout(() => {
    const sel = document.getElementById("book-history-filter");
    if (sel) { sel.value = String(bookID); this.filterBookHistory(String(bookID)); }
  }, 50);
};
