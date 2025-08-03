const fs = require('fs');
const path = require('path');
const marked = require('marked');

/**
 * Enhanced MIT HSC Website Builder
 * Auto-discovers assets and builds galleries with minimal configuration
 */

const CONFIG = {
  contentDir: path.join(__dirname, '../content'),
  publicDir: path.join(__dirname, '../public'),
  assetsDir: path.join(__dirname, '../public/assets'),
  templateFile: 'index.html',
  backupFile: 'index.backup.html'
};

const SECTION_MAPPING = {
  'chaplain': 'OUR-CHAPLAIN',
  'mit-hsc': 'MIT-HSC',
  'events': 'EVENTS',
  'photos': 'PHOTOS',
  'officers': 'OFFICERS'
};

/**
 * Auto-discover all images in a directory
 */
function discoverImages(directory, category = '') {
  const images = [];
  const dirPath = path.join(CONFIG.assetsDir, directory);

  if (!fs.existsSync(dirPath)) return images;

  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    if (file.match(/\.(jpg|jpeg|png|gif|webp)$/i) && !file.startsWith('.')) {
      const name = path.basename(file, path.extname(file));
      images.push({
        filename: file,
        name: formatImageName(name),
        path: `assets/${directory}/${file}`,
        category: category
      });
    }
  });

  return images.sort((a, b) => a.filename.localeCompare(b.filename));
}

/**
 * Convert filename to readable name
 * "john-doe.jpg" → "John Doe"
 * "2022_1.png" → "Event Photo 1"
 */
function formatImageName(filename) {
  // Handle numbered photos
  if (filename.match(/^\d{4}_\d+$/)) {
    const num = filename.split('_')[1];
    return `Event Photo ${num}`;
  }

  // Handle regular names
  return filename
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Load optional configuration for assets
 */
function loadAssetConfig(type) {
  const configPath = path.join(CONFIG.contentDir, `${type}-config.json`);
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  return {};
}

/**
 * Generate photo gallery automatically
 */
function generatePhotoGallery() {
  const photos = discoverImages('photos', 'event');
  const config = loadAssetConfig('photos');

  let gallery = '<table>\n<thead>\n<tr>\n<th>Photo</th>\n<th>Photo</th>\n<th>Photo</th>\n</tr>\n</thead>\n<tbody>\n';

  // Group photos into rows of 3
  for (let i = 0; i < photos.length; i += 3) {
    gallery += '<tr>\n';
    for (let j = 0; j < 3; j++) {
      const photo = photos[i + j];
      if (photo) {
        const title = config[photo.filename] || photo.name;
        gallery += `<td><div class="circular--portrait"><a href="${photo.path}" target="_blank" rel="noopener noreferrer"><img src="${photo.path}" alt="${title}"></a></div></td>\n`;
      } else {
        gallery += '<td></td>\n';
      }
    }
    gallery += '</tr>\n';
  }

  gallery += '</tbody>\n</table>';
  return gallery;
}

/**
 * Generate events table automatically  
 */
function generateEventsTable() {
  const posters = discoverImages('event_posters', 'event');
  const config = loadAssetConfig('events');

  let table = '<table>\n<thead>\n<tr>\n<th>Image</th>\n<th>Event</th>\n<th>Date</th>\n<th>Description</th>\n</tr>\n</thead>\n<tbody>\n';

  posters.forEach(poster => {
    const eventConfig = config[poster.filename] || {};
    const name = eventConfig.name || poster.name;
    const date = eventConfig.date || 'TBD';
    const description = eventConfig.description || 'Event details coming soon!';

    table += `<tr>\n<td><img src="${poster.path}" alt="${name}" style="max-width: 120px; height: auto;"></td>\n`;
    table += `<td>${name}</td>\n<td>${date}</td>\n<td>${description}</td>\n</tr>\n`;
  });

  table += '</tbody>\n</table>';
  return table;
}

/**
 * Generate officers table automatically
 */
function generateOfficersTable() {
  const profiles = discoverImages('profile_pictures', 'profile');
  const config = loadAssetConfig('officers');

  let table = '<table>\n<thead>\n<tr>\n<th>Officer</th>\n<th>Position</th>\n<th>Name</th>\n<th>Email</th>\n</tr>\n</thead>\n<tbody>\n';

  profiles.forEach(profile => {
    const officerConfig = config[profile.filename] || {};
    const name = officerConfig.name || profile.name;
    const position = officerConfig.position || 'Member';
    const email = officerConfig.email || 'member';

    table += `<tr>\n<td><div class="circular--portrait"><img src="${profile.path}" alt="${name}"></div></td>\n`;
    table += `<td>${position}</td>\n<td>${name}</td>\n<td><code>${email}</code></td>\n</tr>\n`;
  });

  table += '</tbody>\n</table>';
  return table;
}

/**
 * Enhanced markdown renderer
 */
function setupMarkdownRenderer() {
  const renderer = new marked.Renderer();

  renderer.paragraph = (token) => {
    if (token.tokens && token.tokens.length > 0) {
      let processedText = '';
      for (const subToken of token.tokens) {
        switch (subToken.type) {
          case 'link':
            processedText += `<a href="${subToken.href}"${subToken.title ? ` title="${subToken.title}"` : ''}>${subToken.text}</a>`;
            break;
          case 'text':
            processedText += subToken.text;
            break;
          case 'image':
            let src = subToken.href;
            if (src.startsWith('/assets/')) {
              src = src.substring(1);
            }
            processedText += `<img src="${src}" alt="${subToken.text}" class="chaplain-photo">`;
            break;
          case 'strong':
            processedText += `<strong>${subToken.text}</strong>`;
            break;
          case 'em':
            processedText += `<em>${subToken.text}</em>`;
            break;
          case 'code':
            processedText += `<code>${subToken.text}</code>`;
            break;
          default:
            processedText += subToken.text || subToken.raw || '';
        }
      }
      return `<p align="justify">${processedText}</p>`;
    }
    return `<p align="justify">${token.text || ''}</p>`;
  };

  renderer.heading = (token) => {
    const text = token.text || '';
    const level = token.depth || 1;
    return `<h${level}>${text}</h${level}>`;
  };

  marked.setOptions({
    renderer,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    xhtml: true
  });
}

/**
 * Process content with auto-generated galleries
 */
function processContentWithAutoGeneration(filePath, sectionId) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix asset paths
  content = content.replace(/\/assets\//g, 'assets/');

  // Parse markdown to HTML
  let htmlContent = marked.parse(content);

  // Auto-generate sections that need it
  if (sectionId === 'PHOTOS') {
    // Replace any existing table with auto-generated gallery
    const gallery = generatePhotoGallery();
    htmlContent = htmlContent.replace(/<table>.*?<\/table>/s, gallery);
  } else if (sectionId === 'EVENTS') {
    // Add auto-generated events table
    const eventsTable = generateEventsTable();
    htmlContent += `\n${eventsTable}`;
  } else if (sectionId === 'OFFICERS') {
    // Add auto-generated officers table
    const officersTable = generateOfficersTable();
    htmlContent += `\n${officersTable}`;
  }

  return htmlContent;
}

/**
 * Update section in HTML template
 */
function updateSection(sectionId, htmlContent) {
  const indexPath = path.join(CONFIG.publicDir, CONFIG.templateFile);
  let template = fs.readFileSync(indexPath, 'utf8');

  const startComment = `<!-- ${sectionId} section content will be injected here -->`;
  const startIndex = template.indexOf(startComment);

  if (startIndex === -1) {
    throw new Error(`Section ${sectionId} not found in template`);
  }

  const before = template.substring(0, startIndex);
  const after = template.substring(startIndex + startComment.length);
  const updatedTemplate = before + htmlContent + after;

  fs.writeFileSync(indexPath, updatedTemplate);
  return true;
}

/**
 * Build the enhanced website
 */
function buildSite() {
  console.log('🚀 Building MIT HSC website with auto-discovery...');

  setupMarkdownRenderer();

  let updateCount = 0;
  const totalSections = Object.keys(SECTION_MAPPING).length;

  for (const [fileName, sectionId] of Object.entries(SECTION_MAPPING)) {
    const mdPath = path.join(CONFIG.contentDir, `${fileName}.md`);

    if (!fs.existsSync(mdPath)) {
      console.warn(`⚠️  Missing: ${fileName}.md`);
      continue;
    }

    try {
      const htmlContent = processContentWithAutoGeneration(mdPath, sectionId);
      updateSection(sectionId, htmlContent);
      console.log(`✓ Updated: ${sectionId}`);
      updateCount++;
    } catch (error) {
      console.error(`✗ Failed: ${sectionId} - ${error.message}`);
    }
  }

  // Report asset discovery
  const profiles = discoverImages('profile_pictures').length;
  const posters = discoverImages('event_posters').length;
  const photos = discoverImages('photos').length;

  console.log(`🎨 Auto-discovered: ${profiles} profiles, ${posters} posters, ${photos} photos`);
  console.log(`✅ Build complete: ${updateCount}/${totalSections} sections updated`);

  return updateCount === totalSections;
}

if (require.main === module) {
  const success = buildSite();
  process.exit(success ? 0 : 1);
}

module.exports = { buildSite };