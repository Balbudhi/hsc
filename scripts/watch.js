const chokidar = require('chokidar');
const path = require('path');
const { buildSite } = require('./build');

/**
 * Development file watcher for MIT HSC website
 * Automatically rebuilds site when markdown content changes
 */

const contentDir = path.join(__dirname, '../content');

console.log('📁 Watching content directory for changes...');

chokidar.watch(path.join(contentDir, '*.md'), {
  ignoreInitial: true,
  persistent: true
}).on('all', (event, filePath) => {
  const fileName = path.basename(filePath);
  console.log(`📝 Detected ${event} in ${fileName}`);

  const success = buildSite();
  if (success) {
    console.log('✅ Website updated successfully\n');
  } else {
    console.log('❌ Website update failed\n');
  }
});