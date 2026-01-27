const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const FILE_PATH = path.join(__dirname, "../PhantomReports.xlsx");

const STATES = ["Sydney", "Melbourne", "Adelaide", "Perth", "Brisbane"];

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

async function writeJobToExcel(job) {
  const workbook = new ExcelJS.Workbook();

  if (fs.existsSync(FILE_PATH)) {
    await workbook.xlsx.readFile(FILE_PATH);
  }

  // create sheets if not exist
  STATES.forEach((state) => {
    let sheet = workbook.getWorksheet(state);
    if (!sheet) {
      sheet = workbook.addWorksheet(state);

      sheet.addRow([
        "Date",
        "Week",
        "Customer",
        "Phone",
        "Address",
        "Price",
        "Cleaner",
        "Status"
      ]);
    }
  });

  const sheet = workbook.getWorksheet(job.state);
  if (!sheet) return;

  const today = new Date();
  const week = `Week ${getWeekNumber(today)}`;

  sheet.addRow([
    today.toLocaleDateString(),       
    week,                 
    job.customerName,
    job.phone,                         
    job.address,                        
    job.price,                         
    job.assignedEmployee?.name || "N/A",
    job.status                          
  ]);

  await workbook.xlsx.writeFile(FILE_PATH);
}

module.exports = { writeJobToExcel };
