class Student {
  constructor(id, name, grades, attendance) {
    this.id = id;
    this.name = name;
    this.grades = grades;
    this.attendance = attendance;
  }

  getAverage() {
    return this.grades.reduce((sum, g) => sum + g, 0) / this.grades.length;
  }

  getGrade(average) {
    if (average >= 90) return "A";
    else if (average >= 80) return "B";
    else if (average >= 70) return "C";
    else if (average >= 60) return "D";
    else if (average >= 50) return "E";
    else return "F";
  }

  getFinalResult() {
    const average = this.getAverage();
    const grade = this.getGrade(average);

    if (average >= 50 && this.attendance >= 75) {
      return { status: "ناجح", grade, average };
    } else if (average >= 50 && this.attendance < 75) {
      return { status: "راسب (حضور)", grade, average };
    } else {
      return { status: "راسب", grade, average };
    }
  }
}

let students = [];
let gradeChartInstance = null;
let passChartInstance = null;




const form = document.getElementById("studentForm");
const tableBody = document.getElementById("tableBody");
const rankingList = document.getElementById("rankingList");
const searchInput = document.getElementById("searchInput");
const toast = document.getElementById("toast");



function showToast(message, type = "success") {
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 2500);
}



form.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = parseInt(document.getElementById("studentId").value);
  const name = document.getElementById("studentName").value.trim();
  const g1 = parseFloat(document.getElementById("grade1").value);
  const g2 = parseFloat(document.getElementById("grade2").value);
  const g3 = parseFloat(document.getElementById("grade3").value);
  const attendance = parseFloat(document.getElementById("attendance").value);

  if (students.some((s) => s.id === id)) {
    showToast("⚠️ رقم الجلوس مستخدم بالفعل!", "error");
    return;
  }


  if ([g1, g2, g3].some((g) => g < 0 || g > 100) || attendance < 0 || attendance > 100) {
    showToast("⚠️ القيم يجب أن تكون بين 0 و 100", "error");
    return;
  }

  students.push(new Student(id, name, [g1, g2, g3], attendance));
  form.reset();
  showToast("✅ تمت إضافة الطالب بنجاح");
  render();
});



document.getElementById("fillSample").addEventListener("click", () => {
  const names = ["أحمد محمد", "سارة علي", "محمد خالد", "ليلى حسن", "عمر ياسر", "نور الدين", "هاني سمير", "منى إبراهيم"];
  const randomName = names[Math.floor(Math.random() * names.length)];
  const newId = students.length > 0 ? Math.max(...students.map((s) => s.id)) + 1 : 1;

  document.getElementById("studentId").value = newId;
  document.getElementById("studentName").value = randomName;
  document.getElementById("grade1").value = Math.floor(Math.random() * 60) + 40;
  document.getElementById("grade2").value = Math.floor(Math.random() * 60) + 40;
  document.getElementById("grade3").value = Math.floor(Math.random() * 60) + 40;
  document.getElementById("attendance").value = Math.floor(Math.random() * 50) + 50;
});




function deleteStudent(id) {
  if (!confirm("هل أنت متأكد من حذف هذا الطالب؟")) return;
  students = students.filter((s) => s.id !== id);
  showToast("🗑️ تم حذف الطالب");
  render();
}



document.getElementById("clearBtn").addEventListener("click", () => {
  if (students.length === 0) return showToast("لا توجد بيانات لمسحها", "error");
  if (!confirm("سيتم حذف جميع الطلاب. هل أنت متأكد؟")) return;
  students = [];
  showToast("🗑️ تم مسح جميع البيانات");
  render();
});



searchInput.addEventListener("input", render);


document.getElementById("exportBtn").addEventListener("click", () => {
  if (students.length === 0) return showToast("لا توجد بيانات للتصدير", "error");

  const headers = ["رقم الجلوس", "الاسم", "المادة 1", "المادة 2", "المادة 3", "الحضور %", "المتوسط", "التقدير", "النتيجة"];
  const rows = students.map((s) => {
    const r = s.getFinalResult();
    return [s.id, s.name, s.grades[0], s.grades[1], s.grades[2], s.attendance, r.average.toFixed(2), r.grade, r.status];
  });

  const csv = "\uFEFF" + [headers, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `نتائج_الطلاب_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  showToast("📥 تم تصدير الملف");
});


document.getElementById("printBtn").addEventListener("click", () => window.print());


function render() {
  renderStats();
  renderTable();
  renderRanking();
  renderCharts();
}

// --- الإحصائيات ---
function renderStats() {
  const total = students.length;
  const passed = students.filter((s) => s.getFinalResult().status === "ناجح").length;
  const failed = total - passed;
  const avg = total > 0 ? students.reduce((sum, s) => sum + s.getAverage(), 0) / total : 0;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statPassed").textContent = passed;
  document.getElementById("statFailed").textContent = failed;
  document.getElementById("statAverage").textContent = avg.toFixed(2);
  document.getElementById("totalCount").textContent = `${total} طالب`;
}



function renderTable() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = students.filter(
    (s) => s.name.toLowerCase().includes(query) || String(s.id).includes(query)
  );

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state">
            <div class="icon">📭</div>
            <h3>${students.length === 0 ? "لا توجد بيانات" : "لا توجد نتائج مطابقة"}</h3>
            <p>${students.length === 0 ? "ابدأ بإضافة طالب جديد من النموذج" : "جرّب البحث بكلمة أخرى"}</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  tableBody.innerHTML = filtered
    .map((s, i) => {
      const r = s.getFinalResult();
      const isPass = r.status === "ناجح";
      return `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${s.id}</strong></td>
          <td>${s.name}</td>
          <td>${s.grades.join(" - ")}</td>
          <td>${s.attendance}%</td>
          <td><strong>${r.average.toFixed(2)}</strong></td>
          <td><span class="badge badge-${r.grade}">${r.grade}</span></td>
          <td><span class="badge ${isPass ? "badge-pass" : "badge-fail"}">${r.status}</span></td>
          <td><button class="btn-delete" onclick="deleteStudent(${s.id})">🗑️</button></td>
        </tr>`;
    })
    .join("");
}



function renderRanking() {
  if (students.length === 0) {
    rankingList.innerHTML = `<div class="empty-state"><div class="icon">📭</div><p>لا توجد بيانات بعد</p></div>`;
    return;
  }

  const sorted = [...students].sort((a, b) => b.getAverage() - a.getAverage()).slice(0, 5);

  rankingList.innerHTML = sorted
    .map((s, i) => {
      const rankClass = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
      return `
        <div class="ranking-item">
          <div class="rank-num ${rankClass}">${i + 1}</div>
          <div class="rank-name">${s.name}</div>
          <div class="rank-score">${s.getAverage().toFixed(2)}</div>
        </div>`;
    })
    .join("");
}


function renderCharts() {
  const gradeCounts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  students.forEach((s) => {
    gradeCounts[s.getGrade(s.getAverage())]++;
  });

  const gradeCtx = document.getElementById("gradeChart").getContext("2d");
  if (gradeChartInstance) gradeChartInstance.destroy();
  gradeChartInstance = new Chart(gradeCtx, {
    type: "bar",
    data: {
      labels: ["A", "B", "C", "D", "E", "F"],
      datasets: [{
        label: "عدد الطلاب",
        data: Object.values(gradeCounts),
        backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#f97316", "#ef4444", "#991b1b"],
        borderRadius: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, title: { display: true, text: "توزيع التقديرات", font: { family: "Cairo", size: 14, weight: "bold" } } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1, font: { family: "Cairo" } } }, x: { ticks: { font: { family: "Cairo" } } } },
    },
  });

  const passed = students.filter((s) => s.getFinalResult().status === "ناجح").length;
  const failed = students.length - passed;

  const passCtx = document.getElementById("passChart").getContext("2d");
  if (passChartInstance) passChartInstance.destroy();
  passChartInstance = new Chart(passCtx, {
    type: "doughnut",
    data: {
      labels: ["ناجح", "راسب"],
      datasets: [{
        data: [passed, failed],
        backgroundColor: ["#10b981", "#ef4444"],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { font: { family: "Cairo", size: 13 }, padding: 16 } },
        title: { display: true, text: "نسبة النجاح", font: { family: "Cairo", size: 14, weight: "bold" } },
      },
    },
  });
}

students = [
  new Student(1, "أحمد محمد", [95, 88, 92], 90),
  new Student(2, "سارة علي", [78, 82, 75], 80),
  new Student(3, "ياسر خالد", [65, 70, 68], 65),
  new Student(4, "سارة محمد", [60, 88, 92], 60),
  new Student(5, "سارة علي", [78, 40, 75], 40),
  new Student(6, "عادل خالد", [65, 70, 68], 30),
]
/*resporsev*/ 


function renderTable() {
  const q = searchInput.value.trim().toLowerCase();
  const filtered = students.filter(s => s.name.toLowerCase().includes(q) || String(s.id).includes(q));

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="icon">📭</div><h3>${students.length === 0 ? "لا توجد بيانات" : "لا توجد نتائج مطابقة"}</h3></div></td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map((s, i) => {
    const r = s.getFinalResult();
    const isPass = r.status === "ناجح";
    return `<tr>
      <td data-label="#">${i + 1}</td>
      <td data-label="رقم الجلوس"><strong>${s.id}</strong></td>
      <td data-label="الاسم">${s.name}</td>
      <td data-label="الدرجات">${s.grades.join(" - ")}</td>
      <td data-label="الحضور">${s.attendance}%</td>
      <td data-label="المتوسط"><strong>${r.average.toFixed(2)}</strong></td>
      <td data-label="التقدير"><span class="badge badge-${r.grade}">${r.grade}</span></td>
      <td data-label="النتيجة"><span class="badge ${isPass ? "badge-pass" : "badge-fail"}">${r.status}</span></td>
      <td><button class="btn-delete" onclick="deleteStudent(${s.id})">🗑️ حذف</button></td>
    </tr>`;
  }).join("");
}
// 
