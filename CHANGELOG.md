# Changelog

All notable changes to DetailMaker will be documented in this file.

## [0.1.1.0] - 2026-04-01

### Added
- NAS design knowledge base: 26 real detail pages analyzed across 12 product categories (food, cosmetics, agriculture, industrial, interior, traditional alcohol, etc.)
- New canvas template variants: social_proof C (data-proof layout), detail C (left-text + right-product)
- Smart image search: GPT-4o-mini converts Korean image descriptions to English stock photo keywords
- `imageGuide` parameter for context-aware image generation
- Vitest test framework with 25 tests (colorUtils, textParsers, template retrieval)

### Changed
- Background color alternation pattern based on NAS analysis (light/dark per section order)
- Overlay opacity now adjusts per section: even sections lighter, odd sections darker
- DALL-E 3 prompts include imageGuide context for more relevant generation
- Template variant selection uses section order for visual diversity

### Fixed
- Removed unused `sectionTitle` parameter from image API route and client request
- Corrected misleading test name: template fallback targets `features`, not `hero`
