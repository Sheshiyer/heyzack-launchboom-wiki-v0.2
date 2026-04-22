# Starlight Styling Guide

## Overview

This project now uses Starlight's native CSS custom properties system for all styling. The legacy custom CSS approach has been replaced with a clean, minimal implementation that leverages Starlight's built-in design system.

## Key Changes Made

### 1. Style Reset Completed
- Removed all conflicting custom styles
- Replaced legacy implementations with Starlight's native CSS custom properties
- Created backup of original styles in `src/styles/starlight-custom.css.backup`

### 2. New CSS Architecture

The new `src/styles/starlight-custom.css` file uses only:
- Starlight's native `--sl-*` CSS custom properties
- HeyZack brand gradients integrated through CSS custom properties
- Minimal, clean overrides that work with Starlight's design system

## Available Starlight CSS Custom Properties

### Color System
```css
/* Accent Colors */
--sl-color-accent-low
--sl-color-accent
--sl-color-accent-high

/* Text Colors */
--sl-color-text
--sl-color-text-accent
--sl-color-text-invert

/* Background Colors */
--sl-color-bg
--sl-color-bg-nav
--sl-color-bg-sidebar
--sl-color-bg-inline-code

/* Border Colors */
--sl-color-border
--sl-color-border-accent
```

### Typography
```css
/* Font Families */
--sl-font
--sl-font-mono

/* Font Sizes */
--sl-text-xs
--sl-text-sm
--sl-text-base
--sl-text-lg
--sl-text-xl
--sl-text-2xl
--sl-text-3xl
--sl-text-4xl
--sl-text-5xl
--sl-text-6xl

/* Line Heights */
--sl-line-height
--sl-line-height-headings
```

### Layout
```css
/* Content Width */
--sl-content-width
--sl-content-pad-x
--sl-content-pad-y

/* Sidebar */
--sl-sidebar-width
--sl-sidebar-pad-x

/* Navigation */
--sl-nav-height
--sl-nav-pad-x
--sl-nav-pad-y
```

## HeyZack Brand Integration

### Gradient System
The following gradients are available as CSS custom properties:

```css
/* Primary Gradients */
--gradient-primary: linear-gradient(135deg, #243984 0%, #0c3470 100%);
--gradient-secondary: linear-gradient(135deg, #e82f89 0%, #a82f89 100%);
--gradient-accent: linear-gradient(135deg, #0c3470 0%, #ae78b 100%);

/* Gradient Components */
.gradient-text { background: var(--gradient-primary); -webkit-background-clip: text; }
.gradient-bg { background: var(--gradient-primary); }
.gradient-border { border-image: var(--gradient-primary) 1; }
```

### Email Template Styling
Email templates now use Starlight's default styling system:
- Consistent typography through `--sl-text-*` properties
- Proper color contrast with `--sl-color-*` properties
- Responsive design through Starlight's layout system

## Best Practices

### 1. Use Starlight's Native Properties
```css
/* ✅ Good - Uses Starlight's system */
.custom-component {
  color: var(--sl-color-text-accent);
  background: var(--sl-color-bg-sidebar);
  font-size: var(--sl-text-lg);
}

/* ❌ Avoid - Custom properties that conflict */
.custom-component {
  color: #custom-color;
  background: rgba(255, 255, 255, 0.1);
  font-size: 18px;
}
```

### 2. Leverage Light/Dark Mode
```css
/* Starlight handles light/dark mode automatically */
:root {
  --sl-color-accent: #243984;
}

:root[data-theme='dark'] {
  --sl-color-accent: #4a5fc1;
}
```

### 3. Extend, Don't Override
```css
/* ✅ Good - Extends Starlight's system */
.hero-section {
  background: var(--gradient-primary);
  color: var(--sl-color-text-invert);
  padding: var(--sl-content-pad-y) var(--sl-content-pad-x);
}
```

## File Structure

```
src/styles/
├── starlight-custom.css          # Main styling file (clean, minimal)
├── starlight-custom.css.backup   # Backup of legacy styles
└── ...
```

## Development Workflow

1. **Always use Starlight's CSS custom properties first**
2. **Check the props.css file** in `node_modules/@astrojs/starlight/style/props.css` for available properties
3. **Test in both light and dark modes**
4. **Maintain consistency** with Starlight's design system
5. **Document any new custom properties** added to this guide

## Troubleshooting

### Common Issues

1. **Styles not applying**: Check if you're using the correct `--sl-*` property names
2. **Dark mode issues**: Ensure you're using Starlight's color system instead of hardcoded colors
3. **Layout problems**: Use Starlight's layout properties (`--sl-content-width`, etc.)

### Debugging

```css
/* Temporary debugging - remove in production */
* {
  outline: 1px solid red;
}
```

## Resources

- [Starlight CSS Customization Docs](https://starlight.astro.build/guides/css-and-tailwind/)
- [Starlight GitHub Repository](https://github.com/withastro/starlight)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

---

*Last updated: January 2025*
*This guide reflects the complete style reset and migration to Starlight's native CSS system.*