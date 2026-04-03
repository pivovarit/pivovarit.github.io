# Wedding Invitation Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone, self-contained wedding invitation page at `slub/index.html` with 6 content sections, responsive design, and a modern minimal aesthetic.

**Architecture:** Single HTML file with all CSS inline in `<style>` and minimal JS inline in `<script>`. No external dependencies except Google Fonts (Inter) and a Google Maps iframe. Photos are already in the `slub/` directory as JPEG files.

**Tech Stack:** HTML5, CSS3 (flexbox, grid, media queries), vanilla JavaScript (smooth scroll, active nav highlighting), Google Fonts CDN, Google Maps embed.

---

## File Structure

- **Create:** `slub/index.html` — the entire page (HTML + inline CSS + inline JS)
- **Existing (read-only):** 7 JPEG photos in `slub/` directory

Photo filenames (for reference in all tasks):
1. `14667671-5A55-4D32-BD89-4782DDD79F94_1_105_c.jpeg`
2. `25E4BD39-6680-421B-AF65-680151030F17_1_105_c.jpeg`
3. `371DCF73-AC94-4FFB-9FC5-82662B1EF887_1_105_c.jpeg`
4. `67DEF40B-674B-48DE-94A0-8AD65313EDCB_1_105_c.jpeg`
5. `BA3F9087-A8B5-4794-AC2B-124BFB0431A4_1_105_c.jpeg`
6. `C04A21BA-87A6-4E3B-941B-B413FA63E22D_1_105_c.jpeg`
7. `F0F1D602-A0F8-43AD-86A9-0A94363FC157_1_105_c.jpeg`

---

### Task 1: HTML skeleton + CSS reset + Google Fonts + meta tags

**Files:**
- Create: `slub/index.html`

- [ ] **Step 1: Create the HTML file with doctype, meta tags, Google Fonts, and CSS reset**

```html
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Zaproszenie Ślubne</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', sans-serif;
      background: #ffffff;
      color: #1a1a1a;
      -webkit-font-smoothing: antialiased;
    }
    img { max-width: 100%; display: block; }
  </style>
</head>
<body>
</body>
</html>
```

- [ ] **Step 2: Open in browser to verify blank white page loads with no errors**

Open `slub/index.html` in the browser. Verify:
- No console errors
- White background
- Page title shows "Zaproszenie Ślubne"

- [ ] **Step 3: Commit**

```bash
git add slub/index.html
git commit -m "feat(slub): scaffold HTML skeleton with meta tags and CSS reset"
```

---

### Task 2: Sticky navigation bar

**Files:**
- Modify: `slub/index.html`

- [ ] **Step 1: Add navigation CSS inside the existing `<style>` block, before the closing `</style>`**

```css
/* NAV */
nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
  gap: 32px;
  padding: 14px 20px;
  font-size: 11px;
  font-weight: 300;
  letter-spacing: 3px;
  text-transform: uppercase;
}
nav a {
  color: #999;
  text-decoration: none;
  transition: color 0.2s;
}
nav a:hover,
nav a.active {
  color: #c4a97d;
}

@media (max-width: 640px) {
  nav {
    gap: 12px;
    font-size: 9px;
    letter-spacing: 2px;
    flex-wrap: wrap;
    padding: 10px 12px;
  }
}
```

- [ ] **Step 2: Add navigation HTML inside `<body>`, at the top**

```html
<nav>
  <a href="#para">Para</a>
  <a href="#szczegoly">Szczegóły</a>
  <a href="#harmonogram">Harmonogram</a>
  <a href="#lokalizacja">Lokalizacja</a>
  <a href="#noclegi">Noclegi</a>
  <a href="#prezenty">Prezenty</a>
</nav>
```

- [ ] **Step 3: Verify in browser**

Open `slub/index.html`. Verify:
- Fixed nav bar visible at top
- 6 links centered with gold hover effect
- Resize to mobile width: links wrap, smaller text

- [ ] **Step 4: Commit**

```bash
git add slub/index.html
git commit -m "feat(slub): add sticky navigation bar"
```

---

### Task 3: Hero section (full viewport)

**Files:**
- Modify: `slub/index.html`

- [ ] **Step 1: Add hero CSS inside `<style>`, after the nav styles**

```css
/* HERO */
.hero {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  background: linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.35)),
    url('BA3F9087-A8B5-4794-AC2B-124BFB0431A4_1_105_c.jpeg') center / cover no-repeat;
}
.hero-content { color: #fff; }
.hero h1 {
  font-size: 56px;
  font-weight: 200;
  letter-spacing: 6px;
}
.hero .divider {
  width: 50px;
  height: 1px;
  background: #c4a97d;
  margin: 20px auto;
}
.hero .date {
  font-size: 13px;
  font-weight: 300;
  letter-spacing: 6px;
  color: #e8dcc8;
}
.hero .scroll-hint {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  color: rgba(255, 255, 255, 0.5);
  animation: bounce 2s infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(8px); }
}

@media (max-width: 640px) {
  .hero h1 {
    font-size: 36px;
    letter-spacing: 3px;
  }
  .hero .date {
    font-size: 11px;
    letter-spacing: 4px;
  }
}
```

- [ ] **Step 2: Add hero HTML after `</nav>`, inside `<body>`**

```html
<div class="hero">
  <div class="hero-content">
    <h1>Anna & Piotr</h1>
    <div class="divider"></div>
    <div class="date">21 CZERWCA 2026</div>
  </div>
  <div class="scroll-hint">↓</div>
</div>
```

Note: `Anna & Piotr` and `21 CZERWCA 2026` are placeholders — the user will replace with real names/date.

- [ ] **Step 3: Verify in browser**

Open `slub/index.html`. Verify:
- Full-viewport hero with photo background
- Names centered, large thin font
- Gold divider line
- Date below in gold-ish color
- Bouncing arrow at bottom
- Photo visible through dark overlay
- Mobile: smaller text

- [ ] **Step 4: Commit**

```bash
git add slub/index.html
git commit -m "feat(slub): add full-viewport hero section"
```

---

### Task 4: Shared section styles

**Files:**
- Modify: `slub/index.html`

- [ ] **Step 1: Add shared section CSS inside `<style>`, after hero styles**

```css
/* SECTIONS */
section {
  max-width: 720px;
  margin: 0 auto;
  padding: 100px 24px;
}
section h2 {
  font-size: 28px;
  font-weight: 200;
  letter-spacing: 4px;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 12px;
  color: #1a1a1a;
}
.section-divider {
  width: 40px;
  height: 1px;
  background: #c4a97d;
  margin: 0 auto 48px;
}
section p {
  font-size: 15px;
  font-weight: 300;
  line-height: 1.9;
  color: #444;
  text-align: center;
  margin-bottom: 24px;
}
```

- [ ] **Step 2: Commit**

```bash
git add slub/index.html
git commit -m "feat(slub): add shared section base styles"
```

---

### Task 5: Para (Nasza historia) section

**Files:**
- Modify: `slub/index.html`

- [ ] **Step 1: Add Para CSS inside `<style>`, after section styles**

```css
/* PARA */
.para-hero {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 2px;
  margin-bottom: 48px;
}
.para-block {
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 48px;
}
.para-block.reverse {
  flex-direction: row-reverse;
}
.para-block img {
  width: 45%;
  flex-shrink: 0;
  border-radius: 2px;
  object-fit: cover;
  aspect-ratio: 3 / 4;
}
.para-block .text p {
  text-align: left;
}

@media (max-width: 640px) {
  .para-block,
  .para-block.reverse {
    flex-direction: column;
  }
  .para-block img {
    width: 100%;
  }
}
```

- [ ] **Step 2: Add Para HTML after the hero `</div>`, inside `<body>`**

```html
<section id="para">
  <h2>Nasza historia</h2>
  <div class="section-divider"></div>

  <img class="para-hero" src="25E4BD39-6680-421B-AF65-680151030F17_1_105_c.jpeg"
       alt="Anna i Piotr">

  <div class="para-block">
    <img src="67DEF40B-674B-48DE-94A0-8AD65313EDCB_1_105_c.jpeg" alt="">
    <div class="text">
      <p>Poznaliśmy się pewnego jesiennego wieczoru, kiedy żadne z nas nie spodziewało się, że ten dzień zmieni wszystko. Od pierwszej rozmowy wiedzieliśmy, że to jest coś wyjątkowego.</p>
    </div>
  </div>

  <div class="para-block reverse">
    <img src="C04A21BA-87A6-4E3B-941B-B413FA63E22D_1_105_c.jpeg" alt="">
    <div class="text">
      <p>Po wielu wspólnych podróżach, wieczorach i przygodach, zdecydowaliśmy się na ten najważniejszy krok. Z radością zapraszamy Was do wspólnego świętowania.</p>
    </div>
  </div>

  <div class="para-block">
    <img src="14667671-5A55-4D32-BD89-4782DDD79F94_1_105_c.jpeg" alt="">
    <div class="text">
      <p>Każdy dzień razem jest dla nas wyjątkowy. Cieszymy się, że możemy podzielić się z Wami tym szczególnym momentem.</p>
    </div>
  </div>

  <div class="para-block reverse">
    <img src="371DCF73-AC94-4FFB-9FC5-82662B1EF887_1_105_c.jpeg" alt="">
    <div class="text">
      <p>To będzie dzień pełen radości, miłości i niezapomnianych wspomnień. Nie możemy się doczekać!</p>
    </div>
  </div>

  <div class="para-block">
    <img src="F0F1D602-A0F8-43AD-86A9-0A94363FC157_1_105_c.jpeg" alt="">
    <div class="text">
      <p>Zapraszamy Was do wspólnego świętowania tego wyjątkowego dnia.</p>
    </div>
  </div>
</section>
```

Note: Story text paragraphs are placeholders — the user will replace with their real story. Photo assignment is a first pass — user can rearrange. The hero photo uses one image, and the remaining 5 are spread across the alternating blocks (1 photo is used as the hero background in Task 3, leaving 6 for this section — 1 hero + 5 blocks).

- [ ] **Step 3: Verify in browser**

Open `slub/index.html`. Verify:
- Large hero photo at top of section
- Alternating photo-left/photo-right blocks
- Photos load from `slub/` directory
- Mobile: everything stacks vertically
- Smooth scroll from nav link "Para" jumps here

- [ ] **Step 4: Commit**

```bash
git add slub/index.html
git commit -m "feat(slub): add Para section with photos and story text"
```

---

### Task 6: Szczegoly (Details) section

**Files:**
- Modify: `slub/index.html`

- [ ] **Step 1: Add details CSS inside `<style>`**

```css
/* DETAILS */
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  text-align: center;
}
.detail-card h3 {
  font-size: 12px;
  font-weight: 300;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #c4a97d;
  margin-bottom: 12px;
}
.detail-card p {
  font-size: 15px;
  color: #444;
  line-height: 1.8;
}

@media (max-width: 640px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Add details HTML after the Para `</section>`**

```html
<section id="szczegoly">
  <h2>Szczegóły</h2>
  <div class="section-divider"></div>
  <div class="details-grid">
    <div class="detail-card">
      <h3>Ceremonia</h3>
      <p>Kościół św. Anny<br>ul. Krakowska 12, Warszawa<br><br>Godzina 14:00</p>
    </div>
    <div class="detail-card">
      <h3>Przyjęcie</h3>
      <p>Dwór Oliwski<br>ul. Parkowa 8, Warszawa<br><br>Od godziny 16:00</p>
    </div>
  </div>
</section>
```

Note: Venue names, addresses, and times are placeholders.

- [ ] **Step 3: Verify in browser**

Verify two-column grid on desktop, single column on mobile. Gold headings.

- [ ] **Step 4: Commit**

```bash
git add slub/index.html
git commit -m "feat(slub): add Szczegoly details section"
```

---

### Task 7: Harmonogram (Timeline) section

**Files:**
- Modify: `slub/index.html`

- [ ] **Step 1: Add timeline CSS inside `<style>`**

```css
/* TIMELINE */
.timeline {
  position: relative;
  padding-left: 40px;
  max-width: 400px;
  margin: 0 auto;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #e8e0d4;
}
.timeline-item {
  position: relative;
  margin-bottom: 36px;
}
.timeline-item:last-child {
  margin-bottom: 0;
}
.timeline-item::before {
  content: '';
  position: absolute;
  left: -36px;
  top: 6px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid #c4a97d;
  background: #fff;
}
.timeline-item .time {
  font-size: 12px;
  letter-spacing: 3px;
  color: #c4a97d;
  font-weight: 300;
}
.timeline-item .event {
  font-size: 15px;
  color: #1a1a1a;
  font-weight: 300;
  margin-top: 4px;
}
```

- [ ] **Step 2: Add timeline HTML after the Szczegoly `</section>`**

```html
<section id="harmonogram">
  <h2>Harmonogram</h2>
  <div class="section-divider"></div>
  <div class="timeline">
    <div class="timeline-item">
      <div class="time">14:00</div>
      <div class="event">Ceremonia ślubna</div>
    </div>
    <div class="timeline-item">
      <div class="time">15:30</div>
      <div class="event">Przyjazd gości do sali weselnej</div>
    </div>
    <div class="timeline-item">
      <div class="time">16:00</div>
      <div class="event">Toast powitalny</div>
    </div>
    <div class="timeline-item">
      <div class="time">17:00</div>
      <div class="event">Obiad</div>
    </div>
    <div class="timeline-item">
      <div class="time">19:00</div>
      <div class="event">Pierwszy taniec</div>
    </div>
    <div class="timeline-item">
      <div class="time">20:00</div>
      <div class="event">Zabawa do białego rana</div>
    </div>
  </div>
</section>
```

Note: Timeline events and times are placeholders.

- [ ] **Step 3: Verify in browser**

Verify vertical line, gold dots, time+event pairs. Centered on page.

- [ ] **Step 4: Commit**

```bash
git add slub/index.html
git commit -m "feat(slub): add Harmonogram timeline section"
```

---

### Task 8: Lokalizacja (Location) section with Google Maps embed

**Files:**
- Modify: `slub/index.html`

- [ ] **Step 1: Add map CSS inside `<style>`**

```css
/* MAP */
.map-container {
  width: 100%;
  height: 350px;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 24px;
}
.map-container iframe {
  width: 100%;
  height: 100%;
  border: 0;
}
```

- [ ] **Step 2: Add location HTML after the Harmonogram `</section>`**

```html
<section id="lokalizacja">
  <h2>Lokalizacja</h2>
  <div class="section-divider"></div>
  <p>Miejsce ceremonii i przyjęcia weselnego</p>
  <div class="map-container">
    <!-- Replace the src with actual Google Maps embed URL -->
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2443.5!2d21.0122!3d52.2297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTLCsDEzJzQ3LjAiTiAyMcKwMDAnNDMuOSJF!5e0!3m2!1spl!2spl!4v1"
      allowfullscreen
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade">
    </iframe>
  </div>
</section>
```

Note: The Google Maps embed URL is a placeholder pointing to Warsaw. The user needs to replace it with the actual venue coordinates.

- [ ] **Step 3: Verify in browser**

Verify map renders (or shows Google Maps placeholder). Full width, 350px height.

- [ ] **Step 4: Commit**

```bash
git add slub/index.html
git commit -m "feat(slub): add Lokalizacja section with Google Maps embed"
```

---

### Task 9: Noclegi (Accommodation) section

**Files:**
- Modify: `slub/index.html`

- [ ] **Step 1: Add accommodation CSS inside `<style>`**

```css
/* ACCOMMODATION */
.hotel-card {
  border: 1px solid #f0f0f0;
  padding: 24px;
  margin-bottom: 16px;
  border-radius: 2px;
}
.hotel-card h3 {
  font-size: 16px;
  font-weight: 300;
  margin-bottom: 8px;
  color: #1a1a1a;
}
.hotel-card p {
  text-align: left;
  font-size: 14px;
  line-height: 1.7;
}
```

- [ ] **Step 2: Add accommodation HTML after the Lokalizacja `</section>`**

```html
<section id="noclegi">
  <h2>Noclegi</h2>
  <div class="section-divider"></div>
  <p>Polecamy kilka miejsc w okolicy:</p>
  <div class="hotel-card">
    <h3>Hotel Parkowy ★★★★</h3>
    <p>ul. Zielona 5, Warszawa — 2 km od sali weselnej<br>Rezerwacja: +48 123 456 789</p>
  </div>
  <div class="hotel-card">
    <h3>Pensjonat Pod Lipami</h3>
    <p>ul. Lipowa 12, Warszawa — 3 km od sali weselnej<br>Rezerwacja: +48 987 654 321</p>
  </div>
</section>
```

Note: Hotel names, addresses, and contact info are placeholders.

- [ ] **Step 3: Verify in browser**

Verify hotel cards with subtle borders, left-aligned text inside.

- [ ] **Step 4: Commit**

```bash
git add slub/index.html
git commit -m "feat(slub): add Noclegi accommodation section"
```

---

### Task 10: Prezenty (Gifts) section + footer

**Files:**
- Modify: `slub/index.html`

- [ ] **Step 1: Add prezenty and footer CSS inside `<style>`**

```css
/* PREFERENCES */
.pref-box {
  background: #faf8f5;
  border: 1px solid #f0ece4;
  border-radius: 2px;
  padding: 40px;
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}
.pref-box .icon {
  font-size: 32px;
  margin-bottom: 16px;
}

/* FOOTER */
footer {
  text-align: center;
  padding: 60px 24px;
  border-top: 1px solid #f0f0f0;
}
footer p {
  font-size: 13px;
  font-weight: 200;
  letter-spacing: 2px;
  color: #999;
}
```

- [ ] **Step 2: Add prezenty + footer HTML after the Noclegi `</section>`**

```html
<section id="prezenty">
  <h2>Prezenty</h2>
  <div class="section-divider"></div>
  <div class="pref-box">
    <div class="icon">🌸</div>
    <p>Najważniejsza jest dla nas Wasza obecność. Prosimy jedynie — <strong>zamiast kwiatów</strong>, podarujcie nam wspomnienia i uśmiechy.</p>
  </div>
</section>

<footer>
  <p>Anna & Piotr — 21.06.2026</p>
</footer>
```

- [ ] **Step 3: Verify in browser**

Verify warm-toned box with flower icon, no-flowers message. Footer at bottom with names and date.

- [ ] **Step 4: Commit**

```bash
git add slub/index.html
git commit -m "feat(slub): add Prezenty section and footer"
```

---

### Task 11: Smooth scroll JS + active nav highlighting

**Files:**
- Modify: `slub/index.html`

- [ ] **Step 1: Add JavaScript before the closing `</body>` tag**

```html
<script>
  // Highlight active nav link on scroll
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('nav a');

  function updateActiveNav() {
    const scrollY = window.scrollY + 80;
    let current = '';

    sections.forEach(section => {
      if (scrollY >= section.offsetTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();
</script>
```

Note: `scroll-behavior: smooth` was already added to `html` in Task 1, so clicking nav links already scrolls smoothly. This JS only handles the active-link highlighting.

- [ ] **Step 2: Verify in browser**

Scroll through the page. Verify:
- Clicking nav links smooth-scrolls to section
- Current section's nav link turns gold (#c4a97d)
- Active link updates as you scroll manually

- [ ] **Step 3: Commit**

```bash
git add slub/index.html
git commit -m "feat(slub): add active nav highlighting on scroll"
```

---

### Task 12: Final review and polish

**Files:**
- Modify: `slub/index.html`

- [ ] **Step 1: Test all sections on desktop (>640px wide)**

Open `slub/index.html` in a full-width browser. Verify each section renders correctly:
- Nav: fixed, centered links, gold hover
- Hero: full viewport, photo background, centered text
- Para: hero photo + alternating blocks
- Szczegoly: two-column grid
- Harmonogram: vertical timeline
- Lokalizacja: map embed
- Noclegi: hotel cards
- Prezenty: centered warm box
- Footer: names + date

- [ ] **Step 2: Test all sections on mobile (<=640px wide)**

Use browser DevTools to resize to 375px width. Verify:
- Nav wraps gracefully
- Hero text smaller but readable
- Para blocks stack vertically
- Details grid becomes single column
- All sections have proper padding
- No horizontal overflow

- [ ] **Step 3: Test smooth scroll and nav highlighting**

Click each nav link. Verify smooth scroll to correct section and active highlighting updates.

- [ ] **Step 4: Commit if any fixes were needed**

```bash
git add slub/index.html
git commit -m "fix(slub): polish and responsive fixes"
```
