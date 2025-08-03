const fs = require('fs');
const path = require('path');
const marked = require('marked');

/**
 * Static site generator for MIT HSC website
 * Processes markdown content and injects into HTML template with intelligent asset management
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
 * Configure markdown renderer with intelligent asset handling
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
            // Convert absolute paths to relative
            if (src.startsWith('/assets/')) {
              src = src.substring(1);
            }
            processedText += `<img src="${src}" alt="${subToken.text}"${subToken.title ? ` title="${subToken.title}"` : ''}>`;
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
 * Create backup of the original template if it doesn't exist
 */
function createTemplateBackup() {
  const indexPath = path.join(CONFIG.publicDir, CONFIG.templateFile);
  const backupPath = path.join(CONFIG.publicDir, CONFIG.backupFile);

  if (!fs.existsSync(backupPath)) {
    const currentIndex = fs.readFileSync(indexPath, 'utf8');
    fs.writeFileSync(backupPath, currentIndex);
    console.log('✓ Template backup created');
  }
}

/**
 * Process markdown content with asset path fixing
 */
function processMarkdownContent(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix asset paths from absolute to relative
  content = content.replace(/\/assets\//g, 'assets/');

  return marked.parse(content);
}

/**
 * Add appropriate CSS classes to images based on their purpose
 */
function addImageClasses(htmlContent, sectionId) {
  // Profile pictures in officers section
  if (sectionId === 'OFFICERS') {
    htmlContent = htmlContent.replace(
      /<img([^>]*src="[^"]*profile_pictures[^"]*"[^>]*)>/g,
      '<img$1 class="profile-picture">'
    );
  }

  // Event posters in events section
  if (sectionId === 'EVENTS') {
    htmlContent = htmlContent.replace(
      /<img([^>]*src="[^"]*event_posters[^"]*"[^>]*)>/g,
      '<img$1 class="event-poster">'
    );
  }

  // Gallery photos in photos section
  if (sectionId === 'PHOTOS') {
    htmlContent = htmlContent.replace(
      /<img([^>]*src="[^"]*photos[^"]*"[^>]*)>/g,
      '<img$1 class="gallery-photo">'
    );
  }

  // Chaplain photo
  if (sectionId === 'OUR-CHAPLAIN') {
    htmlContent = htmlContent.replace(
      /<img([^>]*src="[^"]*tyagananda[^"]*"[^>]*)>/g,
      '<img$1 class="chaplain-photo">'
    );
  }

  return htmlContent;
}

/**
 * Update a specific section in the HTML template
 */
function updateSection(sectionId, htmlContent) {
  const indexPath = path.join(CONFIG.publicDir, CONFIG.templateFile);
  let template = fs.readFileSync(indexPath, 'utf8');

  const startComment = `<!-- ${sectionId} section content will be injected here -->`;
  const startIndex = template.indexOf(startComment);

  if (startIndex === -1) {
    throw new Error(`Section ${sectionId} not found in template`);
  }

  // Fix asset paths and add CSS classes
  htmlContent = htmlContent.replace(/src="\/assets\//g, 'src="assets/');
  htmlContent = addImageClasses(htmlContent, sectionId);

  const before = template.substring(0, startIndex);
  const after = template.substring(startIndex + startComment.length);
  const updatedTemplate = before + htmlContent + after;

  fs.writeFileSync(indexPath, updatedTemplate);
  return true;
}

/**
 * Count available assets for reporting
 */
function getAssetSummary() {
  const profileDir = path.join(CONFIG.assetsDir, 'profile_pictures');
  const posterDir = path.join(CONFIG.assetsDir, 'event_posters');
  const photosDir = path.join(CONFIG.assetsDir, 'photos');

  let profiles = 0, posters = 0, photos = 0;

  if (fs.existsSync(profileDir)) {
    profiles = fs.readdirSync(profileDir).filter(f => f.match(/\.(jpg|jpeg|png|gif)$/i)).length;
  }

  if (fs.existsSync(posterDir)) {
    posters = fs.readdirSync(posterDir).filter(f => f.match(/\.(jpg|jpeg|png|gif)$/i)).length;
  }

  if (fs.existsSync(photosDir)) {
    photos = fs.readdirSync(photosDir).filter(f => f.match(/\.(jpg|jpeg|png|gif)$/i) && !f.startsWith('uploaded-image')).length;
  }

  return { profiles, posters, photos };
}

/**
 * Build the complete website from markdown sources
 */
function buildSite() {
  console.log('🔧 Building MIT HSC website...');

  setupMarkdownRenderer();
  createTemplateBackup();

  let updateCount = 0;
  const totalSections = Object.keys(SECTION_MAPPING).length;

  for (const [fileName, sectionId] of Object.entries(SECTION_MAPPING)) {
    const mdPath = path.join(CONFIG.contentDir, `${fileName}.md`);

    if (!fs.existsSync(mdPath)) {
      console.warn(`⚠️  Missing: ${fileName}.md`);
      continue;
    }

    try {
      const htmlContent = processMarkdownContent(mdPath);
      updateSection(sectionId, htmlContent);
      console.log(`✓ Updated: ${sectionId}`);
      updateCount++;
    } catch (error) {
      console.error(`✗ Failed: ${sectionId} - ${error.message}`);
    }
  }

  console.log(`🚀 Build complete: ${updateCount}/${totalSections} sections updated`);

  // Log asset summary
  const assets = getAssetSummary();
  console.log(`📸 Assets: ${assets.profiles} profiles, ${assets.posters} posters, ${assets.photos} photos`);

  return updateCount === totalSections;
}

if (require.main === module) {
  const success = buildSite();
  process.exit(success ? 0 : 1);
}

module.exports = { buildSite };