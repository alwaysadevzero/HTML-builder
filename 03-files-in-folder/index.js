const fs = require('fs');
const path = require('path');


const SOURCE_PATH = 'secret-folder';
const srcPath = path.resolve(__dirname, SOURCE_PATH);

try {
  (async() => {
    const files = await fs.promises.readdir(srcPath, { withFileTypes: true });

    for (const file of files) {
      const stat = await fs.promises.stat(path.join(srcPath, file.name));
			
      if (stat.isFile()) {
        const extension = path.parse(file.name).ext
        const basename = path.parse(file.name).name

        console.log(basename, '-', extension, '-', formatBytes(stat.size));
      }
    }
  })();
} catch(error){
  console.log(error);
}

function formatBytes(bytes) {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(3))} ${sizes[i]}`;
}
