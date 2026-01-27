const Employee = require("../models/Employee");

// ✅ Add Employee
exports.addEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// ✅ Get All Employees (with role filter)
exports.getEmployees = async (req, res) => {
  try {
    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ✅ Get Single Employee
exports.getSingleEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ msg: "Employee not found" });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};