# Design System Document

## 1. Overview & Creative North Star: "The Digital Atelier"

The Creative North Star for this design system is **"The Digital Atelier."** It reimagines the AI-powered product creation process not as a "magic generator," but as a high-end, curated workspace where technology meets craftsmanship. 

To achieve this, the system moves away from the rigid, boxed-in layouts of standard SaaS tools. Instead, it utilizes **Editorial Asymmetry** and **Tonal Depth**. By leveraging expansive white space (the "Atelier Floor") and sophisticated typography, we create an environment that feels authoritative, professional, and bespoke. The design breaks the "template" look by using layered surfaces and intentional overlapping elements, ensuring the product feels like a premium design tool for professionals.

---

## 2. Colors

The palette is rooted in a sophisticated orchestration of deep indigos and soft greys, designed to provide a high-contrast, "ink-on-paper" feel with digital fluidity.

### Palette Strategy
- **Primary (`#3d37a9`) & Secondary (`#4648d4`):** These represent the "Action" layer. Used sparingly to denote intelligence and momentum.
- **Surface Hierarchy:** We utilize the Material surface-container tokens to define depth.
- **The "No-Line" Rule:** Explicitly prohibit the use of 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. For example, a `surface_container_low` sidebar sitting adjacent to a `surface` main content area provides enough visual distinction without the "clutter" of lines.
- **The "Glass & Gradient" Rule:** To elevate main CTAs or "AI-processing" states, use subtle gradients transitioning from `primary` to `primary_container`. For floating panels, use semi-transparent surface colors with a `backdrop-blur` of 12px-20px to create a frosted glass effect.

---

## 3. Typography

The typography strategy uses a "Dual-Tone" approach: **Manrope** for structural authority (headings) and **Inter** for functional precision (body/UI).

| Level | Token | Font Family | Size | Character |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Manrope | 3.5rem | Bold, tight tracking. For Hero statements. |
| **Headline**| `headline-md`| Manrope | 1.75rem | Confident, editorial. For major section starts. |
| **Title**   | `title-lg`   | Inter | 1.375rem | Medium weight. For card headers and modals. |
| **Body**    | `body-md`    | Inter | 0.875rem | Regular. The workhorse for all tooltips/descriptions. |
| **Label**   | `label-sm`   | Inter | 0.6875rem| Uppercase, slightly tracked out. For metadata. |

**Hierarchy Note:** Always lead with Manrope for "The Why" (the creative intent) and switch to Inter for "The How" (the settings and inputs).

---

## 4. Elevation & Depth

In "The Digital Atelier," depth is a function of light and stacking, not lines.

- **The Layering Principle:** Stacking determines importance. 
    - Base Level: `surface`
    - Inset/Background: `surface_container_low`
    - Floating/Active Card: `surface_container_lowest` (Pure White)
- **Ambient Shadows:** Shadows should never be "grey." Use a tinted shadow: `rgba(25, 28, 30, 0.06)` with a 32px blur and 12px Y-offset. This mimics natural ambient light hitting a matte surface.
- **The "Ghost Border":** If accessibility requires a container edge, use the `outline_variant` token at 15% opacity. This creates a "suggestion" of a boundary rather than a hard stop.
- **Motion & Depth:** When an element is focused (e.g., an input field), transition the background from `surface_container` to `surface_container_lowest` and increase the ambient shadow to create a "lift" effect.

---

## 5. Components

### Buttons
- **Primary:** `primary` background with `on_primary` text. Use `lg` roundedness (1rem). No border.
- **Secondary:** `surface_container_highest` background. Creates a sophisticated "tonal" button that feels part of the UI.
- **States:** Hover states should involve a subtle shift to `primary_container` rather than a darken/lighten filter.

### Input Fields
- **Container:** Use `surface_container_low` with a `md` (0.75rem) corner radius.
- **Focus State:** 0px border. Use a 2px "inner glow" or a transition to `surface_container_lowest` to signal activity.
- **Labels:** Always use `label-md` in `on_surface_variant` for a muted, professional look.

### Cards & Lists
- **Forbid Dividers:** Use vertical white space (Token `8` or `10`) to separate items.
- **Selection Chips:** Use `secondary_fixed` for selected states. The high-saturation blue against the soft grey background creates a clear, premium focal point.

### AI Progress/Status
- **The "Subtle Pulse":** Instead of glowing orbs, use a slow, 4-second opacity pulse on a `surface_tint` layer. It feels like the system is "thinking" rather than "generating."

---

## 6. Do's and Don'ts

### Do
- **DO** use asymmetry. Place secondary controls off-center to create a bespoke, designer-centric feel.
- **DO** use the `24` (8.5rem) spacing token for hero sections. Negative space is a premium feature.
- **DO** use high-quality, monochromatic iconography. If using color in icons, use the `tertiary` palette sparingly for emphasis.

### Don't
- **DON'T** use 1px solid borders for anything other than essential accessibility. 
- **DON'T** use pure black `#000000`. Use `on_surface` (`#191c1e`) to maintain the soft, sophisticated tone.
- **DON'T** use standard "AI Glow" effects (bright purple/pink neons). Our AI is a professional tool, not a novelty. Keep effects tonal and muted.
- **DON'T** crowd the UI. If a screen feels busy, increase the background-surface shifts rather than adding more lines or boxes.