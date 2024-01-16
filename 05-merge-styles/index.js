const fs = require('fs').promises;
const path = require('path');

const sourceDir = './styles';
const outputFilePath = './project-dist/bundle.css';

const pathSourceDir = path.resolve(__dirname, sourceDir);
const pathDestinationFile = path.resolve(__dirname, outputFilePath);

const checkDirOrFile = async (pathDirOrFile) => {
  try {
    await fs.access(pathDirOrFile, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const bundleCss = async () => {
  try {
    const checkSourceDir = await checkDirOrFile(pathSourceDir);
    if (!checkSourceDir) {
      return;
    }

    const checkDestinationFile = await checkDirOrFile(pathDestinationFile);
    if (checkDestinationFile) {
      await fs.rm(pathDestinationFile);
    }

    const files = await fs.readdir(pathSourceDir, { withFileTypes: true });

    const styles = [];

    for (const file of files) {
      const fileExt = path.extname(file.name);
      if (file.isFile() && fileExt === '.css') {
        const sourceFilePath = path.resolve(pathSourceDir, file.name);
        try {
          const fileContent = await fs.readFile(sourceFilePath);
          styles.push(fileContent);
        } catch (error) {
          console.error(`Error reading file ${file.name}: ${error.message}`);
        }
      }
    }

    const bundleContent = styles.join('\n');
    await fs.writeFile(pathDestinationFile, bundleContent);
    console.log('Bundle created successfully.');
  } catch (error) {
    console.error(error.message);
  }
};

bundleCss();
