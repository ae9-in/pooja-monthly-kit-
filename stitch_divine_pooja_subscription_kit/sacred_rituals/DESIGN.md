---
name: Sacred Rituals
colors:
  surface: '#fff8f2'
  surface-dim: '#e7d8bf'
  surface-bright: '#fff8f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff2dd'
  surface-container: '#fbecd2'
  surface-container-high: '#f5e6cc'
  surface-container-highest: '#f0e1c7'
  on-surface: '#221b0b'
  on-surface-variant: '#4f4634'
  inverse-surface: '#382f1e'
  inverse-on-surface: '#feefd5'
  outline: '#817662'
  outline-variant: '#d3c5ae'
  surface-tint: '#795900'
  primary: '#795900'
  on-primary: '#ffffff'
  primary-container: '#d4a017'
  on-primary-container: '#503a00'
  inverse-primary: '#f6be39'
  secondary: '#8f4e00'
  on-secondary: '#ffffff'
  secondary-container: '#fe9832'
  on-secondary-container: '#683700'
  tertiary: '#ad302f'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff847c'
  on-tertiary-container: '#7e0a12'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdfa0'
  primary-fixed-dim: '#f6be39'
  on-primary-fixed: '#261a00'
  on-primary-fixed-variant: '#5c4300'
  secondary-fixed: '#ffdcc2'
  secondary-fixed-dim: '#ffb77a'
  on-secondary-fixed: '#2e1500'
  on-secondary-fixed-variant: '#6d3a00'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#8c171b'
  background: '#fff8f2'
  on-background: '#221b0b'
  surface-variant: '#f0e1c7'
typography:
  h1:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h1-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  h2:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  section-padding-lg: 120px
---

## Brand & Style
The brand personality is a bridge between ancient tradition and modern convenience. It is **Luxurious, Devotional, and Harmonious**. This design system avoids the cluttered visual language often associated with mass-market religious products, opting instead for a **Modern Indian Minimalist** aesthetic. 

The UI should feel like an extension of a temple sanctuary—calm, intentional, and high-end. We use a "SaaS-for-Spirituality" approach, combining structured layouts with soft, divine environmental cues like subtle golden glows and intricate, vector-based lotus patterns. The target audience seeks a premium, curated experience for their daily spiritual practice, valuing both authenticity and aesthetic beauty.

## Colors
The palette is rooted in the "Sacred Gold" of temple deities and the "Deep Saffron" of spiritual fire. 

- **Primary (Sacred Gold):** Used for interactive elements, highlights, and borders. It represents enlightenment and high value.
- **Secondary (Deep Saffron):** Used for calls to action and important status indicators (like badges), signifying energy and purity.
- **Tertiary (Temple Red):** Reserved for deep accents, error states, or traditional decorative elements like the "tilak" stroke.
- **Neutral (Sand Beige & Cream):** The canvas. Use these in gradients to mimic the soft, ambient lighting of an oil lamp against stone walls.

## Typography
The typography strategy pairings a high-contrast serif for headings with a systematic sans-serif for functional text.

- **Playfair Display:** Use for all "emotional" text—headlines, quotes, and product names. It evokes the elegance of luxury editorial design.
- **Inter:** Use for all "functional" text—descriptions, pricing, form labels, and navigation. It ensures the subscription service feels efficient and trustworthy.
- **Stylistic Note:** Headings should occasionally use italic variants to highlight sacred words or Sanskrit terms.

## Layout & Spacing
This design system utilizes a **Fixed Grid** on desktop and a **Fluid Grid** on mobile to maintain a sense of structured luxury.

- **Grid:** 12-column system for desktop, 4-column for mobile.
- **Rhythm:** Generous whitespace is essential. Sections should be separated by significant vertical padding (120px on desktop) to allow the content to "breathe," mirroring the quiet space of a meditation hall.
- **Safe Zones:** Always maintain a 24px gutter between cards to prevent the UI from feeling cramped.

## Elevation & Depth
Depth is created through **Tonal Layers** and **Ambient Glows** rather than harsh shadows.

- **Surfaces:** Use high-quality imagery of marble or light wood as background textures for certain containers.
- **Shadows:** Only use very soft, "Divine Glow" shadows: `0px 10px 40px rgba(212, 160, 23, 0.1)`. This creates an aura effect around premium cards.
- **Glassmorphism:** Use for the main navigation bar and checkout sidebars (Backdrop blur: 12px, 80% opacity Cream) to maintain context and layering.

## Shapes
We use **Soft** (4px - 8px) roundedness. While a fully rounded UI feels too "tech," and a sharp UI feels too "corporate," a slight radius provides a contemporary, approachable feel while retaining an architectural, temple-like structure.

- **Decorative Motifs:** Buttons and badges may feature a subtle "arch" or "lotus" corner treatment on one side for brand distinction.
- **Borders:** Use 1px Sacred Gold (#D4A017) borders for primary cards and 0.5px subtle beige for secondary elements.

## Components

### Buttons & Chips
- **Primary Button:** Deep Saffron fill, white Inter SemiBold text. 8px radius.
- **Secondary Button:** Ghost style with Sacred Gold border and text.
- **Floating WhatsApp:** A circular button fixed to the bottom right, using a subtle green glow, but keeping the icon gold/white to match the system.

### Premium Pricing Cards
- Use a Sand Beige background.
- **Badges:** "Most Popular" badges should be a small Temple Red ribbon in the top corner.
- **Pricing:** Playfair Display for the currency/amount, Inter for the "per month" frequency.

### Product Grid Cards
- Cards feature a 1px Gold border. 
- **Quantity Badge:** A small circular Deep Saffron badge on the top right of the product image.

### Interactive Elements
- **Timeline:** Use a vertical line with Gold lotus icons as step indicators for the "How it Works" section.
- **Accordions:** Flat design with a "+" sign that rotates to an "x" on open. Use a soft Cream background fill for the expanded state.
- **Multi-step Forms:** Use a progress bar at the top made of small golden dots that turn into lotus icons as steps are completed.

### Inputs
- **Text Fields:** Bottom-border only (underlined style) to feel more "boutique" and less "form-heavy." Use Sacred Gold for the focus state.