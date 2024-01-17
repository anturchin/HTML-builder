const fs = require('fs').promises;
const path = require('path');

const sourceCssDir = './styles';
const sourcePathDirCss = path.resolve(__dirname, sourceCssDir);
const sourceAssetsDir = './assets';
const sourcePathDirAssets = path.resolve(__dirname, sourceAssetsDir);
const sourceComponentDir = './components';
const sourcePathDirComponents = path.resolve(__dirname, sourceComponentDir);

// output
const destinationDir = './project-dist';
const destinationPathDir = path.resolve(__dirname, destinationDir);
const destinationDirAssets = './assets';
const destinationPathDirAssets = path.resolve(
  destinationPathDir,
  destinationDirAssets,
);

const isExists = async (pathDirOrFile) => {
  try {
    await fs.access(pathDirOrFile, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const checkDirOrFile = async (dirOfFile, pathDirOfFile) => {
  const checkSourceDir = await isExists(pathDirOfFile);
  if (!checkSourceDir) {
    console.warn(`Source dir and file "${dirOfFile}" doesn't exist`);
    console.log('Exiting...');
    process.exit(0);
  }
};

const removeDirRecursive = async (dirPath) => {
  const files = await fs.readdir(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const fileStat = await fs.stat(filePath);

    if (fileStat.isDirectory()) {
      await removeDirRecursive(filePath);
    } else {
      await fs.unlink(filePath);
    }
  }

  await fs.rmdir(dirPath);
};

const createDestinationDir = async () => {
  try {
    const checkDestinationDir = await isExists(destinationPathDir);

    if (checkDestinationDir) {
      await removeDirRecursive(destinationPathDir);
    }

    await fs.mkdir(destinationPathDir, { recursive: true });
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

const bundleCss = async () => {
  try {
    const files = await fs.readdir(sourcePathDirCss, { withFileTypes: true });
    const styles = [];

    for (const file of files) {
      const fileExt = path.extname(file.name);
      if (file.isFile() && fileExt === '.css') {
        const sourceFilePath = path.resolve(sourcePathDirCss, file.name);
        try {
          const fileContent = await fs.readFile(sourceFilePath);
          styles.push(fileContent);
        } catch (error) {
          console.error(
            `Error reading CSS file ${file.name}: ${error.message}`,
          );
        }
      }
    }

    const bundleContent = styles.join('\n');
    await fs.writeFile(
      path.resolve(destinationPathDir, './style.css'),
      bundleContent,
    );
    console.log('Bundle CSS created successfully.');
  } catch (error) {
    console.error(error.message);
  }
};

const bundleHtml = async () => {
  try {
    const files = await fs.readdir(sourcePathDirComponents, {
      withFileTypes: true,
    });
    const componentHtml = {};

    for (const file of files) {
      const fileExt = path.extname(file.name);
      if (file.isFile() && fileExt === '.html') {
        const sourceFilePath = path.resolve(sourcePathDirComponents, file.name);
        const fileName = path.basename(sourceFilePath).split('.')[0];
        try {
          const fileContent = await fs.readFile(sourceFilePath);
          componentHtml[fileName] = fileContent;
        } catch (error) {
          console.error(
            `Error reading CSS file ${file.name}: ${error.message}`,
          );
        }
      }
    }

    const contentHtml = await fs.readFile(
      path.resolve(__dirname, './template.html'),
    );

    const replacedContent = contentHtml
      .toString()
      .replace(/{{(.*?)}}/g, (match, p1) => {
        return componentHtml[p1.trim()] || match;
      });

    await fs.writeFile(
      path.resolve(destinationPathDir, './index.html'),
      replacedContent,
    );

    console.log('Bundle HTML created successfully.');
  } catch (error) {
    console.error(error.message);
  }
};

const copyDir = async (source, destination) => {
  try {
    const sourceStat = await fs.stat(source);

    if (sourceStat.isDirectory()) {
      await fs.mkdir(destination, { recursive: true });

      const files = await fs.readdir(source, {
        withFileTypes: true,
      });

      for (const file of files) {
        const sourcePath = path.resolve(source, file.name);
        const destinationPath = path.resolve(destination, file.name);
        await copyDir(sourcePath, destinationPath);
      }
    } else if (sourceStat.isFile()) {
      const fileContent = await fs.readFile(source);
      await fs.writeFile(destination, fileContent);
      console.log(`File "${path.basename(source)}" copied to "${destination}"`);
    }

    console.log('Copy "assets" process completed.');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

const bundle = async () => {
  try {
    await Promise.all([
      await checkDirOrFile(sourceCssDir, sourcePathDirCss),
      await checkDirOrFile(sourceAssetsDir, sourcePathDirAssets),
      await checkDirOrFile(sourceComponentDir, sourcePathDirComponents),
    ]);
    await createDestinationDir();
    await Promise.all([
      await copyDir(sourcePathDirAssets, destinationPathDirAssets),
      await bundleCss(),
      await bundleHtml(),
    ]);
    console.log('Build process completed successfully.');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

bundle();
