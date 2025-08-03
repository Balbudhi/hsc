# MIT Hindu Students Council Website

Professional website template with 3D animations, responsive design, and lightbox galleries. Designed for HSC chapters and student organizations.

## Quick Start

### Local Development
```bash
npm install
npm start
```
Visit: http://localhost:3000

### Live Deployment
Website is hosted at: `http://web.mit.edu/hsc/www/`

## Content Management

### Editing Content
All website content is stored in `public/index.html`. Edit sections directly:

- **Organization Info:** Lines 65-95
- **Chaplain Information:** Lines 97-125  
- **Events:** Lines 130-210
- **Photo Gallery:** Lines 215-275
- **Officers & Contact:** Lines 280-330

### Adding New Content

#### Officer Profiles
1. Add image to `public/assets/profile_pictures/`
2. Insert table row (around line 290):
```html
<tr>
    <td><div class="circular--portrait"><img src="assets/profile_pictures/name.jpg" alt="Name"></div></td>
    <td>Position</td>
    <td>Full Name</td>
    <td><code>email</code></td>
</tr>
```

#### Event Listings
1. Add poster to `public/assets/event_posters/`
2. Add table entry (around line 140):
```html
<tr>
    <td><div class="circular--portrait"><a href="#poster8"><img src="assets/event_posters/event.png" alt="Event"></a></div></td>
    <td>Event Name</td>
    <td>Date</td>
    <td>Description</td>
</tr>
```
3. Add lightbox popup (around line 460):
```html
<div id="poster8" class="lightbox">
    <a href="#" class="backdrop"></a>
    <img src="assets/event_posters/event.png" alt="Event">
    <a href="#" class="close">&times;</a>
</div>
```

#### Photo Gallery
1. Add photo to `public/assets/photos/`
2. Add to gallery table (around line 230):
```html
<td><div class="circular--portrait"><a href="#lightbox10"><img src="assets/photos/photo.jpg" alt="Description"></a></div></td>
```
3. Add lightbox modal (around line 380):
```html
<div id="lightbox10" class="lightbox">
    <a href="#" class="backdrop"></a>
    <img src="assets/photos/photo.jpg" alt="Description">
    <a href="#" class="close">&times;</a>
</div>
```

## Publishing Updates

### Deploy to MIT Server
```bash
# Copy files to MIT web server
scp -r public/* [username]@athena.dialup.mit.edu:/mit/hsc/www/

# Set permissions via SSH
ssh [username]@athena.dialup.mit.edu
cd /mit/hsc/www
fs sa . system:anyuser rl
fs sa . www:apache rl
```

*Replace `[username]` with your MIT Kerberos ID*

### Verification
Test deployment: `curl -I http://web.mit.edu/hsc/www/`

## Template Usage

This website template is available for any Hindu Students Council chapter. To adapt:

1. Fork this repository
2. Update content in `public/index.html`
3. Replace images in `public/assets/`
4. Deploy to your institution's web hosting

### Key Features
- Mobile-responsive design
- 3D Shivling animation with volumetric lighting
- Lightbox image galleries
- Professional layout optimized for student organizations

## Technical Notes

- Images in `<div class="circular--portrait">` display as circles
- Unique lightbox IDs required (lightbox1, poster1, etc.)
- Keep `public/index.backup.html` as restore point
- Mobile-optimized with viewport constraints

## File Structure
```
public/
├── index.html          # Main content
├── styles.css          # Styling & responsive design
├── lightbox.css        # Image popup styling
├── lightbox.js         # Popup behavior
├── main.js             # 3D animation engine
└── assets/
    ├── profile_pictures/
    ├── event_posters/
    └── photos/
```

## License
MIT License - Free for educational and organizational use