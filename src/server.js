const app = require("./app"); // make sure path is correct
require('dotenv').config({ path: '../.env' });
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});