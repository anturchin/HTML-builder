const fs = require('fs').promises;
const path = require('path');

const pathFolderSecret = path.resolve(__dirname + '/secret-folder');

const displayFileInfo = async (pathFolder) => {
  try {
    const files = await fs.readdir(pathFolder, { withFileTypes: true });

    for (const file of files) {
      if (file.isFile()) {
        const fileNameParts = file.name.split('.');
        const newFileName = fileNameParts.slice(0, -1).join('.');
        const fileExt = fileNameParts.length > 1 ? fileNameParts.pop() : '';
        const filePath = path.resolve(pathFolder, file.name);
        const fileStats = await fs.stat(filePath);
        const fileSize = fileStats.size / 1024;
        console.log(
          `${
            newFileName ? newFileName : fileExt
          } - ${fileExt} - ${fileSize.toFixed(3)}kb`,
        );
      }
    }
  } catch (err) {
    console.error('Error reading folder:', err);
  }
};

displayFileInfo(pathFolderSecret);
