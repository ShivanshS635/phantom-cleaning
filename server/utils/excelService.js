const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

/* ============================
   CONFIG
============================ */

const STATES = ["Sydney", "Melbourne", "Adelaide", "Perth", "Brisbane"];

const EXPORT_DIR = path.join(__dirname, "../exports");

/* ============================
   ENSURE EXPORTS FOLDER
============================ */

function ensureExportsDir() {
  try {
    if (!fs.existsSync(EXPORT_DIR)) {
      fs.mkdirSync(EXPORT_DIR, { recursive: true });
      console.log("📁 exports folder created");
    }
  } catch (err) {
    console.error("❌ Failed to create exports folder", err);
    throw err;
  }
}

/* ============================
   HELPERS
============================ */

function getMonthFileName(dateStr) {
  const d = new Date(dateStr);
  const month = d.toLocaleString("default", { month: "long" });
  const year = d.getFullYear();
  return `PhantomCleaning_${month}_${year}.xlsx`;
}

function getWeekOfMonth(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const adjusted = date.getDate() + firstDay.getDay();
  return Math.ceil(adjusted / 7);
}

function resolveState(state) {
  return STATES.includes(state) ? state : "Other";
}

/* ============================
   MAIN EXCEL SYNC
============================ */

async function upsertJob(job) {
  ensureExportsDir(); // ✅ ALWAYS SAFE

  const workbook = new ExcelJS.Workbook();
  const fileName = getMonthFileName(job.date);
  const filePath = path.join(EXPORT_DIR, fileName);

  if (fs.existsSync(filePath)) {
    await workbook.xlsx.readFile(filePath);
  }

  const stateName = resolveState(job.state);

  let sheet = workbook.getWorksheet(stateName);

  if (!sheet) {
    sheet = workbook.addWorksheet(stateName);
    sheet.columns = [
      { header: "Job ID", key: "_id", width: 26 },
      { header: "Date", key: "date", width: 14 },
      { header: "Week", key: "week", width: 10 },
      { header: "Customer", key: "customer", width: 22 },
      { header: "Phone", key: "phone", width: 16 },
      { header: "Address", key: "address", width: 32 },
      { header: "Cleaner", key: "cleaner", width: 22 },
      { header: "Status", key: "status", width: 14 },
      { header: "Price", key: "price", width: 12 }
    ];
  }

  const jobDate = new Date(job.date);

  const rowData = {
    _id: job._id.toString(),
    date: jobDate.toLocaleDateString(),
    week: `Week ${getWeekOfMonth(jobDate)}`,
    customer: job.customerName,
    phone: job.phone,
    address: job.address,
    cleaner: job.assignedEmployee?.name || "Unassigned",
    status: job.status,
    price: Number(job.price || 0)
  };

  // 🔁 UPSERT BY JOB ID
  const rows = sheet.getRows(2, sheet.rowCount - 1) || [];
  const existingRow = rows.find(
    (r) => r.getCell(1).value === rowData._id
  );

  if (existingRow) {
    Object.values(rowData).forEach((val, idx) => {
      existingRow.getCell(idx + 1).value = val;
    });
  } else {
    sheet.addRow(rowData);
  }

  await workbook.xlsx.writeFile(filePath);
}

module.exports = { upsertJob };
