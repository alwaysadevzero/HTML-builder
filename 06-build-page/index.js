const fs = require('fs');
const path = require('path');


const src = {
  SOURCE_HTML_FILE : 'template.html',
  SOURCE_CSS_PATH : 'styles',
  SOURCE_ASSETS_PATH : 'assets',
  SOURCE_COMPONENTS_PATH : 'components',
  DEST_PATH : 'project-dist',
  DEST_CSS_FILE : 'style.css',
  DEST_HTML_FILE : 'index.html',
};


const SOURCE_CSS_PATH = path.resolve(__dirname, src.SOURCE_CSS_PATH);
const SOURCE_ASSETS_PATH = path.resolve(__dirname, src.SOURCE_ASSETS_PATH);
const SOURCE_COMPONENTS_PATH = path.resolve(__dirname, src.SOURCE_COMPONENTS_PATH);
const SOURCE_HTML_FILE = path.resolve(__dirname, src.SOURCE_HTML_FILE);
const DEST_PATH = path.resolve(__dirname, src.DEST_PATH);
const DEST_ASSETS_PATH = path.join(DEST_PATH, src.SOURCE_ASSETS_PATH);
const DEST_CSS_FILE = path.join(DEST_PATH, src.DEST_CSS_FILE);
const DEST_HTML_FILE = path.join(DEST_PATH, src.DEST_HTML_FILE);


bundleProject();
async function bundleProject() {
  const destIsExist = await isExist(DEST_PATH); //check if destPath exist
  // delete if old destPath exist
  if (destIsExist) await fs.promises.rm(DEST_PATH, { recursive: true, force: true}); 
  await fs.promises.mkdir(DEST_PATH, { recursive: true}); // create path

  //Copy srcAssetsPath to destAssetsPath
  await fs.promises.mkdir(SOURCE_ASSETS_PATH, { recursive: true}); // create path
  copyDir(SOURCE_ASSETS_PATH, DEST_ASSETS_PATH);

  //bundle CSS
  bundleCss(SOURCE_CSS_PATH, DEST_CSS_FILE);

  //bundle HTML 
  bundlehtml(SOURCE_HTML_FILE, SOURCE_COMPONENTS_PATH, DEST_HTML_FILE);
	
}


async function bundlehtml(srcHtmlFile, srcComnponentsPath, destFileHtml) {

  let scrFileData = await fs.promises.readFile(srcHtmlFile, 'utf-8');

  const ComponentsFiles = await getFiles(srcComnponentsPath, '.html');

  for await(const file of ComponentsFiles){
    const basename = path.parse(file).name;
    const template = '{{' + basename + '}}';
    const data = await fs.promises.readFile(file, 'utf-8');

    scrFileData = scrFileData.replace(template, data);
  }

  const destFileW = await fs.promises.open(destFileHtml, 'w'); // recreate file
  await destFileW.write(scrFileData);
  await destFileW.close();
}


async function bundleCss(srcPath, destFile) {
  const files = await getFiles(srcPath, '.css');

  const fileHandle = await fs.promises.open(destFile, 'w'); // recreate file
  await fileHandle.close(); // close file handle

  for await(const file of files) {
    const readStream = fs.createReadStream(file, 'utf-8');
    const writeStream = fs.createWriteStream(destFile, { encoding: 'utf-8', flags: 'a' });
    readStream.pipe(writeStream);
  }
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


async function copyDir(srcPath, destPath) {
  const destIsExist = await isExist(destPath); //check if destPath exist
  // delete if old destPath exist
  if (destIsExist) await fs.promises.rm(destPath, { recursive: true, force: true });
  await fs.promises.mkdir(destPath, { recursive: true }); // create path

  // get files array from srcPath
  const srcFiles = await getFiles(srcPath);
  try {
    for await (const file of srcFiles) {
      const relativeFilePath = path.relative(srcPath, file);
      const destFilePath = path.join(destPath, relativeFilePath);

      // Create necessary subdirectories before copying the file
      const destFileDir = path.dirname(destFilePath);
      await fs.promises.mkdir(destFileDir, { recursive: true });

      await fs.promises.copyFile(file, destFilePath);
    }
  } catch (err) {
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