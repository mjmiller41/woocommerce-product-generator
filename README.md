<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Ambient Studio AI - WooCommerce Product Generator

Ambient Studio AI is a sophisticated React-based e-commerce helper application. It utilizes the official Google GenAI SDK to automatically analyze uploaded product images, extract WooCommerce-compatible metadata, and generate high-fidelity product lifestyle mockups.

View your app in AI Studio: https://ai.studio/apps/555018b4-4cbf-498c-aecd-eb4094a7c636

---

## 🌟 Key Features

- **Automated Product Attribute Scanning:** Automatically extracts e-commerce specifications such as product name, categories, colors, materials, dimensions (length, width, height), weight, and tags using the structured JSON schema capabilities of `gemini-3.5-flash`.
- **Dual-Engine AI Lifestyle Mockups:**
  - **Smart Placement (Image-to-Image):** Seamlessly integrates the exact uploaded product into ambient scenes using `gemini-2.5-flash-image`, maintaining branding, logos, labels, and geometry.
  - **Studio Re-creation (Text-to-Image):** Leverages `imagen-4.0-generate-001` to compile a brand-new photorealistic full studio advertisement banner from the product's visual properties.
- **Scene Customization:** Includes 11 built-in environment presets (such as Luxury Bath, Modern Kitchen, Cozy Cafe, Brutalist Pedestal, RGB Creator Desk) with support for 5 professional lighting profiles, and 5 aspect ratios.
- **IndexedDB Historical Catalog:** Locally caches past product analyses and lifestyle scenes directly in the browser's IndexedDB, preserving your workspace history across page reloads.
- **WooCommerce CSV Export:** Downloads a fully structured product CSV catalog containing all scanned attributes, descriptions, specifications, tags, and categories for direct import into WooCommerce stores.

---

## 🛠️ Technology Stack

- **Framework:** React 19 + TypeScript + Vite 6
- **Styling:** TailwindCSS v4
- **Animations:** Motion (Framer Motion)
- **Icons:** Lucide React
- **Database:** IndexedDB (via native browser API)
- **AI Integration:** Official `@google/genai` (v2.4.0) SDK
- **File Utilities:** `jszip` & `file-saver` (for exporting images and zip archives)

---

## 📁 Project Map

Below is the file structure of the project with links to the corresponding files:

### Configuration Files
- [package.json](file:///home/michael/Code/Projects/woocommerce-product-generator/package.json) — Defines app dependencies (such as React 19, TailwindCSS v4, Vite 6, and Google GenAI SDK).
- [tsconfig.json](file:///home/michael/Code/Projects/woocommerce-product-generator/tsconfig.json) — Configures compilation rules for TypeScript.
- [vite.config.ts](file:///home/michael/Code/Projects/woocommerce-product-generator/vite.config.ts) — Sets up React and TailwindCSS compiler plugin integrations.
- [.env.example](file:///home/michael/Code/Projects/woocommerce-product-generator/.env.example) — Provides a template for local environment variables.

### Core Architecture
- [src/main.tsx](file:///home/michael/Code/Projects/woocommerce-product-generator/src/main.tsx) — Bootstraps the React application.
- [src/App.tsx](file:///home/michael/Code/Projects/woocommerce-product-generator/src/App.tsx) — Houses the main controller state, layout grid, settings modal, and event pipelines.
- [src/types.ts](file:///home/michael/Code/Projects/woocommerce-product-generator/src/types.ts) — Holds TypeScript interfaces defining `ProductAnalysis` schema, `LifestyleConfig`, and `HistoryItem` records.
- [src/index.css](file:///home/michael/Code/Projects/woocommerce-product-generator/src/index.css) — Custom styles and custom brand color configurations.

### Core Libraries
- [src/lib/gemini.ts](file:///home/michael/Code/Projects/woocommerce-product-generator/src/lib/gemini.ts) — Drives Google GenAI API communication, configuring schema-enforced structured product scanning via `gemini-3.5-flash`, smart placement editing via `gemini-2.5-flash-image`, and image generation via `imagen-4.0-generate-001`.
- [src/lib/db.ts](file:///home/michael/Code/Projects/woocommerce-product-generator/src/lib/db.ts) — Manages CRUD operations inside browser IndexedDB for session history caching.
- [src/lib/export.ts](file:///home/michael/Code/Projects/woocommerce-product-generator/src/lib/export.ts) — Orchestrates building and downloading WooCommerce CSV packages.

### Components
- [src/components/ProductUploader.tsx](file:///home/michael/Code/Projects/woocommerce-product-generator/src/components/ProductUploader.tsx) — Drag-and-drop file uploader supporting batch image intake.
- [src/components/AnalysisPanel.tsx](file:///home/michael/Code/Projects/woocommerce-product-generator/src/components/AnalysisPanel.tsx) — Display and editor for extracted product attributes (brand, weight, tags, colors, and prompt reconstruction).
- [src/components/ConfigPanel.tsx](file:///home/michael/Code/Projects/woocommerce-product-generator/src/components/ConfigPanel.tsx) — Interface to configure rendering methods, custom composition instructions, aspect ratios, and lighting profiles.
- [src/components/GenerationViewer.tsx](file:///home/michael/Code/Projects/woocommerce-product-generator/src/components/GenerationViewer.tsx) — Layout viewer offering single image view, drag-and-swipe raw/lifestyle comparison wipe, side-by-side grid view, and zip/image downloader.
- [src/components/HistorySidebar.tsx](file:///home/michael/Code/Projects/woocommerce-product-generator/src/components/HistorySidebar.tsx) — Interactive list showing historical creations with quick restoration.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **NPM** (v9 or higher)
- A **Gemini API Key** (configured through the in-app settings or `.env.local`).
  - *Note: To generate lifestyle images using Imagen 4 model, your Google Cloud billing or paid tier must be enabled.*

### Quick Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Create a `.env.local` file by copying the example template:
   ```bash
   cp .env.example .env.local
   ```
   Provide your `GEMINI_API_KEY` inside `.env.local` if you wish to default-initialize it in the local workspace.

3. Run the application in local development mode:
   ```bash
   npm run dev
   ```

4. Build the application for production:
   ```bash
   npm run build
   ```

---

## ⚡ Technical Workflow & APIs

### 1. Structured Visual Scanning (`gemini-3.5-flash`)
When a user uploads a product image, the app triggers `analyzeProduct` in [src/lib/gemini.ts](file:///home/michael/Code/Projects/woocommerce-product-generator/src/lib/gemini.ts#L36-L117). This transmits the image's raw base64 data to `gemini-3.5-flash` with a strict JSON Schema configuration. 
Gemini extracts attributes like:
```json
{
  "name": "Product name",
  "colors": ["Detected Color 1", "Detected Color 2"],
  "dominantFeatures": ["Visual identifier 1"],
  "description": "Comprehensive description of appearance",
  "category": "E-Commerce Category Path",
  "shortDescription": "Short tagline for WooCommerce catalog listing"
}
```

### 2. Smart Placement (Image-to-Image via `gemini-2.5-flash-image`)
If *Smart Placement* is chosen, the application triggers a content generation request using `gemini-2.5-flash-image`. It sends both the original product's base64 image and a prompt describing the desired ambient setting and lighting. This integrates the product cleanly into the background, matching perspective, lighting, and shadow occlusion.

### 3. Studio Re-creation (Text-to-Image via `imagen-4.0-generate-001`)
If *Studio Re-creation* is chosen, the application uses the descriptive attributes returned by `gemini-3.5-flash` to construct a detailed photography prompt, sending it to `imagen-4.0-generate-001` via the `generateImages` API. This yields a completely fresh, high-resolution lifestyle marketing mock of the product.

### 4. Cataloging & Export
- The final product analysis state and generated image URIs are mapped to a `HistoryItem` object.
- The record is appended to browser memory and committed to IndexedDB via [src/lib/db.ts](file:///home/michael/Code/Projects/woocommerce-product-generator/src/lib/db.ts#L36-L49).
- Exporting to WooCommerce CSV format maps the `ProductAnalysis` schema properties directly to default headers mapped in [src/lib/export.ts](file:///home/michael/Code/Projects/woocommerce-product-generator/src/lib/export.ts#L3-L75).
