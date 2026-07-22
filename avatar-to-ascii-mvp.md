# Avatar to ASCII — MVP Implementation Plan

## 1. Product Summary

Avatar to ASCII is a browser-based application that converts an uploaded avatar into a grid of letters and colors.

The primary use case is generating a visual asset that can be used in a GitHub profile README, personal website, social profile, or developer portfolio.

The MVP will run entirely in the browser. Uploaded images will not be sent to a server.

## 2. MVP Goal

Allow a user to:

1. Upload an image.
2. Convert the image into colored or monochrome ASCII art.
3. Customize the output.
4. Preview the result in real time.
5. Export the final result as PNG or SVG.
6. Copy a Markdown snippet for use in a GitHub README.

## 3. MVP Scope

### Included

- Image upload from the user's device
- Local image processing
- ASCII conversion
- Colored ASCII mode
- Monochrome ASCII mode
- Adjustable output resolution
- Character set presets
- Background color selection
- Brightness control
- Contrast control
- Live preview
- PNG export
- SVG export
- GitHub Markdown snippet generation
- Responsive interface
- Basic validation and error handling

### Not Included

- User accounts
- Database
- Cloud storage
- Image history
- Social sharing
- Public galleries
- AI-based image enhancement
- Animated avatars
- GIF or video support
- Server-side rendering of generated images
- Direct GitHub integration

## 4. User Flow

1. The user opens the application.
2. The user uploads a JPG, PNG, or WebP image.
3. The application displays the original image.
4. The image is resized internally to the selected grid resolution.
5. Each pixel or pixel group is converted into a character.
6. The character receives either:
   - The original pixel color
   - A monochrome output color
7. The result is displayed in the preview.
8. The user adjusts settings.
9. The user exports the result as PNG or SVG.
10. The application generates a Markdown example for the exported file.

Example:

```md
![ASCII Avatar](./assets/ascii-avatar.svg)
```

## 5. Functional Requirements

### 5.1 Image Upload

The application must:

- Accept JPG, JPEG, PNG, and WebP files
- Reject unsupported formats
- Enforce a configurable maximum file size
- Show a readable error message when the upload is invalid
- Process the image locally
- Allow the user to replace the uploaded image

Recommended MVP limit:

```txt
Maximum file size: 10 MB
```

### 5.2 Image Processing

The application must:

- Load the uploaded image into an HTML canvas
- Resize the image to a smaller internal grid
- Preserve the original aspect ratio
- Correct for the aspect ratio of monospace characters
- Read pixel data using `getImageData`
- Convert pixel brightness into a character index
- Preserve RGB values for colored output
- Handle transparency

Brightness formula:

```ts
const brightness =
  0.2126 * red +
  0.7152 * green +
  0.0722 * blue;
```

### 5.3 ASCII Conversion

The default character set should represent different visual densities.

Example:

```ts
const characters = "@%#*+=-:. ";
```

Dark pixels should use denser characters. Light pixels should use less dense characters.

The conversion logic must support:

- Normal brightness mapping
- Inverted brightness mapping
- Multiple character presets
- Custom character input, if time permits

Suggested presets:

```txt
Detailed: @%#*+=-:. 
Blocks: █▓▒░ 
Minimal: #*:. 
Binary: 10
Letters: ABCDEFGHI
```

### 5.4 Output Modes

The MVP must provide two modes.

#### Colored

Each character uses a color sampled from the original image.

#### Monochrome

All characters use one user-selected color.

### 5.5 Customization Controls

The user must be able to configure:

- Output width or grid density
- Character set
- Colored or monochrome mode
- Foreground color for monochrome mode
- Background color
- Brightness
- Contrast
- Invert brightness
- Transparent background for supported exports

Optional controls:

- Saturation
- Character size
- Line height
- Pixel sampling method

### 5.6 Live Preview

The preview must:

- Update when settings change
- Preserve the avatar aspect ratio
- Use a monospace font
- Support light and dark backgrounds
- Avoid freezing the page during normal use
- Display a loading state during processing

### 5.7 PNG Export

The application must:

- Render the ASCII result to a canvas
- Export the canvas with `canvas.toBlob`
- Preserve the selected background
- Support transparent background when enabled
- Generate a useful filename

Example:

```txt
ascii-avatar.png
```

### 5.8 SVG Export

The application must:

- Generate a valid standalone SVG file
- Render characters using SVG text elements
- Preserve character colors
- Preserve the selected background
- Support transparent background
- Escape special characters
- Generate a useful filename

Example:

```txt
ascii-avatar.svg
```

SVG is the recommended format for GitHub because it remains sharp at different sizes.

### 5.9 Markdown Snippet

After export, the application should show a Markdown snippet.

Example:

```md
![ASCII Avatar](./assets/ascii-avatar.svg)
```

The application should include a button to copy the snippet.

The user will still need to upload the exported file to a GitHub repository manually.

## 6. Non-Functional Requirements

### Privacy

- Images must remain in the browser
- No image upload to external services
- No analytics event should contain image data
- Object URLs must be revoked when no longer needed

### Performance

- Settings changes should feel responsive
- Large source images should be resized before pixel processing
- Processing should avoid unnecessary repeated canvas operations
- Debounce expensive settings changes when needed

### Accessibility

- All controls must have labels
- Buttons must be keyboard accessible
- Focus states must be visible
- Error messages must be readable by screen readers
- Color controls must include text labels
- The interface should not rely only on color to communicate state

### Browser Support

Target current versions of:

- Chrome
- Edge
- Firefox
- Safari

## 7. Recommended Technical Stack

```txt
Framework: Next.js
Language: TypeScript
UI: React
Styling: Tailwind CSS
Components: shadcn/ui, optional
Image processing: Canvas API
Export: Canvas API and generated SVG
State: React state or Zustand
Testing: Vitest or Jest, React Testing Library, Playwright
Deployment: Vercel, Cloudflare Pages, or Netlify
```

A backend is not required for the MVP.

## 8. Suggested Project Structure

```txt
src/
  app/
    page.tsx
    layout.tsx
  components/
    avatar-uploader.tsx
    ascii-preview.tsx
    customization-panel.tsx
    export-panel.tsx
    markdown-snippet.tsx
  hooks/
    use-ascii-generator.ts
    use-image-loader.ts
  lib/
    ascii/
      calculate-brightness.ts
      convert-image.ts
      character-presets.ts
      render-canvas.ts
      render-svg.ts
    files/
      download-blob.ts
      validate-image.ts
  types/
    ascii.ts
  workers/
    ascii.worker.ts
```

A Web Worker is optional for the first version, but the architecture should allow processing to be moved into one later.

## 9. Suggested Data Model

```ts
type OutputMode = "color" | "monochrome";

type AsciiSettings = {
  columns: number;
  characterSet: string;
  outputMode: OutputMode;
  foregroundColor: string;
  backgroundColor: string;
  brightness: number;
  contrast: number;
  invert: boolean;
  transparentBackground: boolean;
};

type AsciiCell = {
  character: string;
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

type AsciiResult = {
  width: number;
  height: number;
  cells: AsciiCell[][];
};
```

## 10. Core Conversion Algorithm

### Step 1: Load the image

Use either:

```ts
URL.createObjectURL(file)
```

or:

```ts
FileReader
```

`URL.createObjectURL` is preferable for a simple local preview.

### Step 2: Calculate the internal grid

The user selects the number of columns.

The number of rows is calculated from:

- Original image aspect ratio
- Character width-to-height ratio

Example:

```ts
const characterAspectRatio = 0.55;

const rows = Math.round(
  columns *
  (imageHeight / imageWidth) *
  characterAspectRatio
);
```

The exact correction value should be tested with the selected font.

### Step 3: Draw the resized image

```ts
context.drawImage(image, 0, 0, columns, rows);
```

### Step 4: Read pixels

```ts
const imageData = context.getImageData(
  0,
  0,
  columns,
  rows
);
```

### Step 5: Map brightness to characters

```ts
function getCharacter(
  brightness: number,
  characters: string,
  invert: boolean
): string {
  const normalized = brightness / 255;
  const value = invert ? 1 - normalized : normalized;

  const index = Math.min(
    characters.length - 1,
    Math.floor(value * characters.length)
  );

  return characters[index];
}
```

### Step 6: Store each cell

Each output cell stores:

- Character
- Red
- Green
- Blue
- Alpha

### Step 7: Render the preview

The preview can initially be rendered using:

- Canvas for better performance
- SVG for export
- HTML only for very small previews

Canvas is recommended for the live preview.

## 11. UI Layout

### Desktop

```txt
┌─────────────────────────────────────────────┐
│ Header                                      │
├───────────────────┬─────────────────────────┤
│ Controls          │ Preview                 │
│                   │                         │
│ Upload            │                         │
│ Resolution        │                         │
│ Character set     │                         │
│ Colors            │                         │
│ Brightness        │                         │
│ Contrast          │                         │
│ Export            │                         │
└───────────────────┴─────────────────────────┘
```

### Mobile

```txt
Header
Upload
Preview
Controls
Export
Markdown snippet
```

## 12. Main Components

### AvatarUploader

Responsibilities:

- File input
- Drag and drop
- File validation
- Original image preview
- Error display

### CustomizationPanel

Responsibilities:

- Resolution
- Character preset
- Output mode
- Colors
- Brightness
- Contrast
- Invert
- Transparent background

### AsciiPreview

Responsibilities:

- Render the generated output
- Display loading state
- Display empty state
- Fit the result inside the preview area

### ExportPanel

Responsibilities:

- Export PNG
- Export SVG
- Choose filename
- Show export errors

### MarkdownSnippet

Responsibilities:

- Display the GitHub Markdown example
- Copy the snippet to the clipboard
- Explain that the file must be added to a repository

## 13. Error Handling

The MVP must handle:

- Unsupported file type
- File too large
- Corrupted image
- Image loading failure
- Canvas context unavailable
- Browser export failure
- Clipboard permission failure
- Empty character set
- Very small or very large grid values

Errors should be shown near the action that caused them.

## 14. Security Considerations

Although the MVP is client-side, it should still:

- Validate file MIME type
- Validate the decoded image
- Limit image dimensions and file size
- Escape text added to SVG
- Avoid injecting generated SVG directly through unsafe HTML
- Avoid using uploaded filenames as raw HTML
- Revoke temporary object URLs

## 15. Testing Strategy

### Unit Tests

Test:

- Brightness calculation
- Brightness inversion
- Character selection
- Aspect-ratio calculation
- File validation
- SVG escaping
- Output filename generation

### Component Tests

Test:

- Upload success
- Upload validation errors
- Settings changes
- Mode switching
- Copy Markdown action
- Export button states

### End-to-End Tests

Test the complete flow:

1. Open the application.
2. Upload a test avatar.
3. Change the output settings.
4. Verify the preview updates.
5. Export PNG.
6. Export SVG.
7. Copy the Markdown snippet.

## 16. Analytics

Analytics is optional for the MVP.

When included, track only product interactions such as:

- Image selected
- Preset selected
- PNG exported
- SVG exported
- Markdown copied

Never send:

- Image contents
- Pixel values
- Generated avatar data
- Local filenames, unless sanitized or omitted

## 17. Implementation Milestones

### Milestone 1: Project Foundation

- Create the Next.js project
- Add TypeScript
- Configure Tailwind CSS
- Create the main page layout
- Add basic responsive structure

### Milestone 2: Upload and Image Loading

- Implement file input
- Implement drag and drop
- Validate image type and size
- Load the image locally
- Show the original image preview

### Milestone 3: ASCII Engine

- Resize the image using canvas
- Read pixel data
- Calculate brightness
- Map brightness to characters
- Handle color and transparency
- Correct character aspect ratio

### Milestone 4: Preview and Controls

- Render the ASCII output
- Add resolution control
- Add character presets
- Add colored and monochrome modes
- Add background and foreground colors
- Add brightness and contrast
- Add invert option

### Milestone 5: Export

- Implement PNG generation
- Implement SVG generation
- Implement file download
- Generate Markdown snippet
- Add clipboard support

### Milestone 6: Quality

- Add loading and error states
- Add accessibility improvements
- Add unit tests
- Add end-to-end tests
- Validate responsive behavior
- Test major browsers

### Milestone 7: Deployment

- Add metadata and favicon
- Add privacy notice
- Build the production version
- Deploy the application
- Run final smoke tests

## 18. Acceptance Criteria

The MVP is complete when:

- A user can upload a valid image
- The image is processed only in the browser
- A recognizable ASCII avatar is generated
- The user can switch between color and monochrome
- The user can select at least three character presets
- The user can change output resolution
- The user can change background color
- The user can adjust brightness and contrast
- The preview updates after configuration changes
- The user can export a valid PNG
- The user can export a valid SVG
- The user can copy a GitHub Markdown snippet
- The interface works on desktop and mobile
- Invalid uploads show useful error messages
- Core conversion functions have automated tests

## 19. MVP Definition of Done

The application is considered ready for an initial public release when:

- All acceptance criteria are met
- There are no known critical bugs
- Exported assets display correctly in a GitHub README
- The application works in the supported browsers
- Uploaded images are never sent to a server
- The deployed application has a clear privacy statement
- The repository contains setup and contribution instructions

## 20. Future Improvements

Possible additions after the MVP:

- Custom character sets
- Dithering algorithms
- Palette reduction
- Multiple font choices
- GitHub light and dark theme presets
- Side-by-side original and generated previews
- Preset sharing through URL parameters
- Local history using IndexedDB
- Animated GIF support
- Video conversion
- Web Worker processing
- PWA and offline support
- Direct GitHub repository integration
- Public gallery
- Account-based saved creations
