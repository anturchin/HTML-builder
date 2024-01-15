const fs = require('fs').promises;
const path = require('path');

const pathFolder = path.resolve(__dirname + '/secret-folder');

const displayFileInfo = async () => {
  try {
    const files = await fs.readdir(pathFolder, { withFileTypes: true });

    for (const file of files) {
      if (file.isFile()) {
        const fileName = file.name.split('.')[0];
        const fileExt = path.extname(file.name).slice(1);
        const filePath = path.resolve(pathFolder, file.name);
        const fileStats = await fs.stat(filePath);
        const fileSize = fileStats.size / 1024;

        console.log(`${fileName} - ${fileExt} - ${fileSize.toFixed(3)}kb`);
      }
    }
  } catch (err) {
    console.error('Error reading folder:', err);
  }
};

displayFileInfo();
