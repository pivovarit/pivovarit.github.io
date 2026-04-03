# Wedding Invitation Page — Design Spec

## Overview

A standalone wedding invitation subpage at `slub/index.html`. Fully independent from the main site — no shared styles, navigation, or branding. Polish language. Public access (no auth).

## Tech Stack

- Single self-contained HTML file (`slub/index.html`)
- Inline CSS, minimal vanilla JS (smooth scroll, sticky nav)
- Google Fonts CDN (Inter, weight 200/300/400)
- Google Maps iframe embed
- No build system, no frameworks
- Photos served from existing `slub/*.jpg` files

## Visual Design

- **Style:** Modern & minimal
- **Palette:** Black (#1a1a1a), white (#ffffff), gold accent (#c4a97d), warm off-white backgrounds (#faf8f5, #f5f2ed)
- **Typography:** Inter, thin weight (200) for headings with wide letter-spacing, light (300) for body text
- **Layout:** Mobile-first responsive, max-width 720px content column

## Page Structure

### Sticky Navigation
- Fixed top bar, semi-transparent white with backdrop blur
- Links to all 6 sections
- Uppercase, small font, wide letter-spacing
- Responsive: wraps on mobile, smaller font

### 1. Hero (full viewport)
- Full-screen section with background photo (one of the `slub/*.jpg` images)
- Dark gradient overlay for text readability
- Centered content: couple's names (large, thin, wide-spaced), gold divider line, date
- Scroll-down hint arrow at bottom

### 2. Para (Nasza historia)
- Section heading: uppercase, thin, gold divider below
- One large hero photo (full-width, 16:9 aspect ratio) at the top
- Alternating photo+text blocks below:
  - Left: photo (45% width, 3:4 aspect), right: text paragraph
  - Next row: reversed (text left, photo right)
  - On mobile: stacks vertically (photo then text)
- Uses the 7 existing JPEGs from `slub/` directory

### 3. Szczegoly (Details)
- Two-column grid (single column on mobile)
- Left card: Ceremony — venue name, address, time
- Right card: Reception — venue name, address, time
- Gold uppercase labels for card headings

### 4. Harmonogram (Timeline)
- Vertical timeline with a thin gold-ish line on the left
- Circle markers (gold border, white fill) at each event
- Each item: time (gold, small, letter-spaced) + event name
- Placeholder events to be filled in by the user

### 5. Lokalizacja (Location)
- Brief text description
- Embedded Google Maps iframe (full-width, 350px height)
- Map coordinates to be provided by the user

### 6. Noclegi (Accommodation)
- Introductory text
- Hotel cards with subtle border:
  - Hotel name + star rating
  - Address, distance from venue, contact info
- Placeholder data to be filled in by the user

### 7. Prezenty (Gifts/Preferences)
- Centered warm-toned box (#faf8f5 background, gold-ish border)
- Flower icon
- Polite message asking guests not to bring flowers
- No mention of money — Polish wedding culture handles that implicitly

### Footer
- Simple centered text: couple's names + date
- Top border separator

## Responsive Behavior

- **Desktop (>640px):** Full layout as described, two-column grids, side-by-side photo+text
- **Mobile (<=640px):** Single column throughout, stacked photo+text blocks, full-width photos, smaller hero text, wrapped nav links

## Content Placeholders

The following need to be filled in by the user:
- Couple's actual names
- Wedding date
- Ceremony venue name, address, time
- Reception venue name, address, time
- Timeline events and times
- Google Maps embed coordinates/URL
- Hotel recommendations (names, addresses, contact)
- "Para" story text paragraphs
- Photo assignment (which of the 7 photos goes where)

## What This Page Is NOT

- Not connected to the main pivovarit.github.io site in any way
- No dark theme, no particle animations, no tech branding
- No RSVP form
- No FAQ section
- No password protection (for now)
