const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

/* ========== SECURITY ========== */
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

/* ========== CORS ========== */
app.use(
  cors({
    origin: "https://phantom-cleaning.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.use(express.json());

/* ========== ROUTES ========== */
app.get("/", (req, res) => {
  res.send("Phantom Cleaning Backend Running");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/jobs", require("./routes/job.routes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/tasks", require("./routes/task.routes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
/* ========== SERVER ========== */
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
