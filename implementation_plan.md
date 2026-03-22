# Premium Personal Portfolio & Blog Extension Plan

## Goal Description
Extend the current single-card landing page into a full-featured, single-page scrolling portfolio. This design will incorporate details from your LinkedIn (Senior Software Engineer @ Credit Saison India) and GitHub (Java/Spring/FinTech), maintaining the cinematic feel and glassmorphism theme, but introducing structured sections for 'About', 'Portfolio', 'Skills', and 'Experience'.

## User Review Required
> [!IMPORTANT]
> I recommend a **Single-Page (SPA) Scroll** architecture. It feels faster, more modern, and allows us to use "scrollreveal" animations that match the cinematic style you love. 

> [!NOTE]
> We will add the following sections sequentially as the user scrolls down:
> 1. **The Hero (Landing):** Current state (The Glass Card + Socials).
> 2. **About Me:** Professional bio highlighting your 8+ years of experience, NIT Durgapur roots, and FinTech expertise at Credit Saison.
> 3. **The Bento Grid (Skills & Tech):** A modern, tiled layout showing categories like "Backend (Java/Spring)", "Frontend (HTML/JS/CSS)", and "System Architecture".
> 4. **Portfolio Gallery:** A responsive grid of your best projects like `DND_Check`, `PINCODE_details`, and `catalog-service`.
> 5. **Experience Timeline:** A vertical history of your career path (Credit Saison, etc.).
> 6. **Blog Highlights:** A section with cards for your recent writings (e.g., "Architecture Patterns", "Clean Code").

## Proposed Changes

### Layout & Sections (HTML)
- Add `<section>` tags for each component (About, Portfolio, Skills, etc.).
- Implement a **Sticky Navigation Bar** (semi-transparent glass) that appears as you scroll down to allow quick jumping between sections.
- Ensure the Resume download button remains highly visible in the top navigation and the Hero card.

### Styling & Interactivity (CSS)
- **Scroll Reveal Animations:** Add classes that animate elements (fade-in, slide-up) as they enter the viewport.
- **Glassmorphic Consistency:** Every section block will share the same `.glass-card` styling for a unified aesthetic.
- **Project Hover Effects:** Projects in the portfolio will have a subtle 'glow-up' and scale effect upon hovering.
- **Smooth Scrolling:** Add `scroll-behavior: smooth` for elegant internal link navigation.

## Verification Plan

### Automated Tests
- N/A for static design files.

### Manual Verification
1. I will boot up a local Python server (`python3 -m http.server 8080`).
2. I will use my `browser_subagent` to visually capture the newly designed page and verify that:
   - The background continues to pan.
   - The staggered animations execute correctly on load.
   - The glassmorphism card looks premium and perfectly centers the text.
3. I will share a recording/screenshot with you so you can see the new premium look.
