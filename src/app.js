const express = require("express");
const cors = require('cors');
const app = express();
const path = require('path')

app.use(express.json());
const cookieParser = require("cookie-parser");

app.use(cors({
  origin: ["http://localhost:5174", "http://localhost:5173", "https://mcs-internship-portal.vercel.app", "https://admin-internship-site-eb8x.vercel.app"],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true
}));
app.use(cookieParser());

app.use("/static", express.static(path.join(__dirname, "../public")));
// app.use(cors({ origin: "http://localhost:5174" }));

// Use routes
// app.use("/", adminRoutes);

// Import routes
const departmentRoutes = require("./routes/departmentRoutes");
const batchRoutes = require("./routes/batchRoutes");
const courseAdvisorRoutes = require("./routes/courseAdvisorRoutes");
const studentRoutes = require("./routes/studentRoutes"); // Add this line
const internshipRoutes = require('./routes/internshipRoutes');
const loginRoutes = require("./routes/loginFunctionalities");
const adminRoutes = require("./routes/adminRoutes");
// Use routes
app.use("/api/departments", departmentRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/course-advisors", courseAdvisorRoutes);
app.use("/api/students", studentRoutes); // Add this line
app.use('/api/internships', internshipRoutes);
app.use("/api", loginRoutes); // ✅ added
app.use("/signup",adminRoutes);


module.exports = app;