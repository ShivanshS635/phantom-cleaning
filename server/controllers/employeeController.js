const Employee = require("../models/Employee");

const STATES = ["Sydney", "Melbourne", "Adelaide", "Perth", "Brisbane"];

exports.addEmployee = async (req, res) => {
  try {
    const { state } = req.body;

    if (!STATES.includes(state)) {
      return res.status(400).json({ message: "Invalid state selected" });
    }

    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


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

exports.getSingleEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ msg: "Employee not found" });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
