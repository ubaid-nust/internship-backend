const express = require("express");
const cors = require('cors');
const app = express();
const path = require('path')

app.use(express.json());
const cookieParser = require("cookie-parser");

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser requests like Postman
    if (origin.endsWith('.vercel.app') || origin.startsWith('http://localhost')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
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