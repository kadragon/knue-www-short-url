# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Korean URL shortener for KNUE (Korea National University of Education) bulletin board URLs. It uses client-side encoding/decoding without requiring a database or server-side storage, operating as a static web application that handles URL shortening through query parameters.

## Development Commands

- **Development server**: `npm run dev` - Starts Vite dev server with hot reload
- **Build**: `npm run build` - Creates optimized production build in `dist/`
- **Tests**: `npm test` - Runs Vitest test suite with jsdom environment

## Architecture

### Core Components

- **src/index.js**: Core encoding/decoding logic using Sqids library
  - `encodeURL()`: Converts site/key/bbsNo/nttNo parameters to short code
  - `decodeURL()`: Converts short code back to original URL parameters
- **src/main.js**: Client-side entry point that handles URL parsing and UI logic
- **src/siteMap.js**: Maps KNUE site names to numeric IDs for encoding efficiency

### URL Processing Flow

1. **Encoding Mode**: URLs with `=` in query string (e.g., `?site=www&key=123&bbsNo=456&nttNo=789`)

   - Extracts parameters and encodes to short code
   - Returns JSON response with encoded code
   - Generates QR code and provides clipboard copy functionality

2. **Decoding Mode**: URLs without `=` in query string (e.g., `?ABC123`)

   - Decodes short code to original parameters
   - Redirects to original KNUE URL
   - Shows error and redirects to home on decode failure

3. **Default Mode**: No query parameters - displays application title

### Key Dependencies

- **sqids**: For reversible URL encoding/decoding
- **qrcode**: For QR code generation
- **vite**: Build tool and dev server
- **vitest**: Testing framework with jsdom for DOM testing

### Site Mapping

The application supports 36 different KNUE subdomains mapped to numeric IDs in `siteMap.js`. When encoding, site names are converted to numbers for more efficient encoding, then reversed during decoding.

### Testing

Tests are organized in `test/` directory:

- `index.test.js`: Tests core encoding/decoding functions
- `main.test.js`: Tests client-side URL processing logic

Uses Vitest with jsdom environment for DOM manipulation testing.
