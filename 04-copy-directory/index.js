const fs = require('fs').promises;
const { ReadStream, WriteStream } = require('fs');
const path = require('path');

const sourceDir = './files';
const destinationDir = './files-copy';

const pathSourceDir = path.resolve(__dirname, sourceDir);
const pathDestinationDir = path.resolve(__dirname, destinationDir);

const checkDir = async (pathDir) => {
  try {
    await fs.access(pathDir, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const copyDir = async () => {
  try {
    const checkSourceDir = await checkDir(pathSourceDir);
    if (!checkSourceDir) {
      return;
    }

    const checkDestinationDir = await checkDir(pathDestinationDir);
    if (checkDestinationDir) {
      await fs.rm(pathDestinationDir, { recursive: true });
    }

    await fs.mkdir(pathDestinationDir, { recursive: true });
    const files = await fs.readdir(pathSourceDir, { withFileTypes: true });
    files.forEach((file) => {
      const sourceFilePath = path.resolve(pathSourceDir, file.name);
      const destinationFilePath = path.resolve(pathDestinationDir, file.name);
      const readFileStream = new ReadStream(sourceFilePath);
      const writeFileStream = new WriteStream(destinationFilePath);
      readFileStream.pipe(writeFileStream);

      writeFileStream.on('finish', () => {
        console.log(
          `file "${file.name}" was copied along the way "${destinationFilePath}"`,
        );
      });
    });
  } catch (error) {
    console.error(error.message);
  }
};

copyDir();
