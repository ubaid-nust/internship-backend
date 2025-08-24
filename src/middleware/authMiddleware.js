// const jwt = require("jsonwebtoken");

// // roles = [] means allow all authenticated users
// // roles = ["admin"] means only admins
// // roles = ["student"] means only students
// // roles = ["course_advisor"] means only course advisors
// const auth = (roles = []) => {
//   return (req, res, next) => {
//     try {
//       const authHeader = req.header("Authorization");
//       if (!authHeader) {
//         return res.status(401).json({ error: "No token provided" });
//       }

//       const token = authHeader.split(" ")[1];
//       if (!token) {
//         return res.status(401).json({ error: "Invalid authorization format" });
//       }

//       // Verify token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = decoded; // { role, id, batch_id }

//       // Role-based access check
//       if (roles.length > 0 && !roles.includes(decoded.role)) {
//         return res.status(403).json({ error: "Forbidden: insufficient rights" });
//       }

//       next();
//     } catch (err) {
//       console.error("Auth error:", err.message);
//       return res.status(401).json({ error: "Invalid or expired token" });
//     }
//   };
// };

// module.exports = auth;

const jwt = require("jsonwebtoken");

const auth = (roles = []) => {
  return (req, res, next) => {
    try {
      let token;

      // Try to read from cookie first
      if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
      }

      // Or from Authorization header
      if (!token && req.header("Authorization")) {
        const authHeader = req.header("Authorization");
        if (authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7, authHeader.length);
        }
      }

      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { role, id, batch_id }

      // Role-based access check
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: "Forbidden: insufficient rights" });
      }

      next();
    } catch (err) {
      console.error("Auth error:", err.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
};

module.exports = auth;