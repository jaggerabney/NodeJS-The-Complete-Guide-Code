const fs = require("fs");

function deleteFile(filePath) {
  fs.unlinkSync(filePath, (error) => {
    if (error) {
      throw error;
    }
  });
}

module.exports = deleteFile;
