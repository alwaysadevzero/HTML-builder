const fs = require('fs').promises;
const path = require('path');


const SOURCE_PATH = 'files';
const DEST_PATH = 'files-copy';

const srcPath = path.resolve(__dirname, SOURCE_PATH);
const destPath = path.resolve(__dirname, DEST_PATH);

copyDir(srcPath, destPath);

async function copyDir(srcPath, destPath) {

  const destIsExist = await isExist(destPath); //check if destPath exist
  // delete if old destPath exist
  if (destIsExist) await fs.rm(destPath, { recursive: true, force: true}); 
  await fs.mkdir(destPath, { recursive: true}); // create path
  // get files array from srcPath
  const srcFiles = await getFiles(srcPath);
  try {
    for await (const file of srcFiles) {
      const relativeFilePath = path.relative(srcPath, file);
      const destFilePath = path.join(destPath, relativeFilePath);

      await fs.copyFile(file, destFilePath);
    }
  } catch(err) {
    console.error(err, ' Files could not be copied');
  }
}

async function isExist(dir) {
  let dirHandle;
  try {
    dirHandle = await fs.promises.opendir(dir);
  } catch(err) {
    return false;
  }
  
  if (dirHandle) {
    await dirHandle.close();
  }
  return true;
}

async function getFiles(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}