const fs = require('fs');
const path = require('path');

const SOURCE_PATH = 'styles';
const DEST_PATH = 'project-dist';
const OUTPUT_FILE = 'bundle.css';

const srcPath = path.resolve(__dirname, SOURCE_PATH);
const destPath = path.resolve(__dirname, DEST_PATH);
const destFile = path.join(destPath, OUTPUT_FILE);

bundleCss(srcPath, destFile);

async function bundleCss(srcPath, destFile) {
	
  const files = await getFiles(srcPath, '.css');

  await bundleFile(destFile, files);
}

async function getFiles(dir, ext='') {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  let files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));

  if (ext) files = files.filter(file => path.parse(file).ext === ext);

  return Array.prototype.concat(...files);
}

async function bundleFile(dstFile, srcFiles) {
  await fs.promises.open(dstFile, 'w'); //zz recreate file

  for await(const srcFile of srcFiles) {
    const readStream = fs.createReadStream(srcFile, 'utf-8');
    const writeStream = fs.createWriteStream(dstFile, { encoding: 'utf-8', flags: 'a' });
    readStream.pipe(writeStream);
  }
}