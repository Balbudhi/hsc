# MIT Hindu Students Council Website

Interactive website with 3D animations and lightbox galleries.

## Setup

```bash
npm install
npm start
```

Visit: http://localhost:3000

## Content Updates

All content is in `public/index.html`. Edit directly and refresh browser.

### Text Content

**MIT HSC Info:** Lines 65-95  
**Chaplain:** Lines 97-125  
**Events:** Lines 130-210  
**Photos:** Lines 215-275  
**Officers:** Lines 280-330  

### Adding Images

#### Officers
1. Add image: `public/assets/profile_pictures/name.jpg`
2. Add table row around line 290:
```html
<tr>
    <td><div class="circular--portrait"><img src="assets/profile_pictures/name.jpg" alt="Name"></div></td>
    <td>Position</td>
    <td>Full Name</td>
    <td><code>email</code></td>
</tr>
```

#### Events (with popup)
1. Add poster: `public/assets/event_posters/event.png`
2. Add table row around line 140:
```html
<tr>
    <td><div class="circular--portrait"><a href="#poster8"><img src="assets/event_posters/event.png" alt="Event"></a></div></td>
    <td>Event Name</td>
    <td>Date</td>
    <td>Description</td>
</tr>
```
3. Add popup at end around line 460:
```html
<div id="poster8" class="lightbox">
    <a href="#" class="backdrop"></a>
    <img src="assets/event_posters/event.png" alt="Event">
    <a href="#" class="close">&times;</a>
</div>
```

#### Photos (with popup)
1. Add photo: `public/assets/photos/photo.jpg`
2. Add to table around line 230:
```html
<td><div class="circular--portrait"><a href="#lightbox10"><img src="assets/photos/photo.jpg" alt="Description"></a></div></td>
```
3. Add popup at end around line 380:
```html
<div id="lightbox10" class="lightbox">
    <a href="#" class="backdrop"></a>
    <img src="assets/photos/photo.jpg" alt="Description">
    <a href="#" class="close">&times;</a>
</div>
```

### Key Points

- Wrap images in `<div class="circular--portrait">` for circular styling
- Lightbox IDs must be unique (lightbox1, lightbox2, poster1, poster2...)
- Save file and refresh browser to see changes
- Keep `public/index.backup.html` as backup

## File Structure

```
public/
├── index.html          # Main content
├── styles.css          # Styling
├── lightbox.css        # Image popup styling
├── lightbox.js         # Image popup behavior
├── main.js             # 3D engine
└── assets/
    ├── profile_pictures/
    ├── event_posters/
    └── photos/
```

## License

MIT License