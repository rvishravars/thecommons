# Screenshots Guide

## Required Screenshots

Please capture the following screenshots for the main README:

### 1. Assembly Canvas (`assembly-canvas.png`)
**What to capture:**
- Full interface showing all three phase lanes (Intuition, Design, Logic)
- At least one spark loaded with some content
- Show the toolbar with "Quiz Me", "Preview", "Copy MD", and "Download" buttons
- Make sure the spark name is visible at the top

**How to capture:**
1. Load an existing spark (like reputation-shield)
2. Take a full browser screenshot
3. Save as `assembly-canvas.png`

### 2. Building Blocks (`building-blocks.png`)
**What to capture:**
- Close-up of building blocks showing:
  - Phase-colored borders (blue, yellow, green)
  - Icons next to block titles
  - Maximize and edit icons in the top-right
  - Some content filled in
  - Character counter at the bottom

**How to capture:**
1. Zoom in on one of the phase lanes
2. Show 2-3 building blocks with content
3. Save as `building-blocks.png`

### 3. Full-Screen Editor (`fullscreen-editor.png`)
**What to capture:**
- A building block expanded to full-screen mode
- Show the dark overlay/backdrop
- Show the X close button in the top-right
- Show the large textarea with content
- Show the "Done" button at the bottom

**How to capture:**
1. Click the maximize icon on any building block
2. Wait for the full-screen modal to appear
3. Take a screenshot
4. Save as `fullscreen-editor.png`

### 4. Quiz Mode (`quiz-mode.png`)
**What to capture:**
- The Quiz Me modal showing either:
  - AI provider selection screen (OpenAI, Anthropic, Local Template)
  - OR a question with multiple choice options
  - OR the results screen with score

**How to capture:**
1. Click "Quiz Me" button in the toolbar
2. Choose one of the screens to capture (provider selection or quiz question)
3. Save as `quiz-mode.png`

### 5. Spark Selector & Preview (`spark-selector.png`)
**What to capture:**
- Left sidebar showing existing sparks
- Stability badges (X/3 Stable) with colors
- Refresh button at the top
- Optional: Show the preview panel if space allows

**How to capture:**
1. Make sure some sparks are loaded
2. Capture the left sidebar area
3. Save as `spark-selector.png`

## Screenshot Specifications

- **Format**: PNG
- **Resolution**: At least 1920x1080 (or retina/4K if available)
- **Browser**: Chrome or Firefox (for best rendering)
- **Theme**: Make sure the dark theme is showing properly
- **Content**: Use actual spark data (like reputation-shield) for realistic examples

## Tools for Taking Screenshots

### macOS
- **Full screen**: Cmd + Shift + 3
- **Selection**: Cmd + Shift + 4
- **Window**: Cmd + Shift + 4, then Space, then click window

### Linux
- **GNOME**: Press Print Screen
- **KDE**: Spectacle (pre-installed)
- **Command line**: `gnome-screenshot` or `scrot`

### Windows
- **Full screen**: Print Screen
- **Window**: Alt + Print Screen
- **Snipping Tool**: Search for "Snipping Tool" in Start menu

### Browser Extensions
- **Awesome Screenshot** (Chrome/Firefox)
- **Fireshot** (Chrome/Firefox)
- **Full Page Screen Capture** (Chrome)

## After Taking Screenshots

1. Place all PNG files in this directory (`docs/screenshots/`)
2. Make sure filenames match exactly:
   - `assembly-canvas.png`
   - `building-blocks.png`
   - `fullscreen-editor.png`
   - `quiz-mode.png`
   - `spark-selector.png`
3. The README will automatically display them (relative paths already configured)
4. Commit and push to git

## Optional: Compress Screenshots

To keep the repository size reasonable, consider compressing the screenshots:

```bash
# Using ImageOptim (macOS)
imageoptim docs/screenshots/*.png

# Using optipng (cross-platform)
optipng -o7 docs/screenshots/*.png

# Using pngquant (lossy but smaller)
pngquant --quality=80-95 docs/screenshots/*.png
```

Target file size: <500KB per screenshot for fast README loading.
