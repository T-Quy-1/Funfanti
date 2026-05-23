export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const borderRadius = {
  none: 0,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  full: 999,
};

export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.12)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  xxl: '0 25px 50px rgba(0, 0, 0, 0.2)',
};

// Gradients for visual enhancement
export const gradients = {
  purpleToBlue: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
  greenToTeal: 'linear-gradient(135deg, #00a86b 0%, #14b8a6 100%)',
  orangeToCoral: 'linear-gradient(135deg, #f97316 0%, #ff6b6b 100%)',
  blueToTeal: 'linear-gradient(135deg, #2563eb 0%, #14b8a6 100%)',
  purpleToOrange: 'linear-gradient(135deg, #7c3aed 0%, #f97316 100%)',
  brandGradient: 'linear-gradient(135deg, #0a3d62 0%, #1a5a94 100%)',
  successGradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
  softGradient: 'linear-gradient(135deg, #f9fafc 0%, #f0f3ed 100%)',
};

// Typography scales
export const typography = {
  // Headings - reduced from 800-900 to 600-700
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40, letterSpacing: 0 },
  h2: { fontSize: 28, fontWeight: '600', lineHeight: 36, letterSpacing: 0 },
  h3: { fontSize: 24, fontWeight: '600', lineHeight: 32, letterSpacing: 0 },
  h4: { fontSize: 20, fontWeight: '600', lineHeight: 28, letterSpacing: 0 },
  
  // Body
  body1: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body2: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  body3: { fontSize: 12, fontWeight: '400', lineHeight: 18 },
  
  // Labels - reduced from 600 to 500
  label1: { fontSize: 14, fontWeight: '500', lineHeight: 20, letterSpacing: 0.5 },
  label2: { fontSize: 12, fontWeight: '500', lineHeight: 16, letterSpacing: 0.3 },
  
  // Special
  caption: { fontSize: 11, fontWeight: '400', lineHeight: 14 },
  button: { fontSize: 14, fontWeight: '500', lineHeight: 20, letterSpacing: 0.5 },
};
