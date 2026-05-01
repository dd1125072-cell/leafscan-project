// ── RICE ONLY ─────────────────────────────────────────────────────────────
export const PLANT_LIST = ['Rice'];

export const DISEASE_INFO = {
  Bacterial_Blight: {
    displayName: 'Bacterial Blight',
    severity: 'High',
    color: '#dc2626',
    description: 'Caused by Xanthomonas oryzae pv. oryzae. Causes yellowing and wilting of leaves, leading to significant yield loss.',
    treatment: [
      'Apply copper-based bactericides immediately.',
      'Remove and destroy infected plant parts.',
      'Avoid overhead irrigation to reduce leaf wetness.',
      'Use resistant rice varieties in future seasons.',
      'Ensure proper field drainage to reduce humidity.',
    ]
  },
  Rice_Blast: {
    displayName: 'Rice Blast',
    severity: 'Very High',
    color: '#7c3aed',
    description: 'Caused by the fungus Magnaporthe oryzae. Produces diamond-shaped lesions with grey centers and can infect all parts of the plant.',
    treatment: [
      'Apply systemic fungicides such as Tricyclazole or Isoprothiolane.',
      'Avoid excessive nitrogen fertilization.',
      'Maintain proper spacing between plants for airflow.',
      'Remove infected debris and avoid crop residue buildup.',
      'Use certified blast-resistant rice varieties.',
    ]
  },
  Brown_Spot: {
    displayName: 'Brown Spot',
    severity: 'Moderate',
    color: '#d97706',
    description: 'Caused by Helminthosporium oryzae. Appears as brown oval lesions on leaves, often associated with nutrient-deficient soils.',
    treatment: [
      'Apply Mancozeb or Iprodione fungicide to affected areas.',
      'Improve soil fertility with balanced NPK fertilizers.',
      'Use disease-free certified seeds for the next planting.',
      'Avoid water stress during critical growth stages.',
      'Treat seeds with fungicides before sowing.',
    ]
  },
  Healthy: {
    displayName: 'Healthy',
    severity: 'None',
    color: '#16a34a',
    description: 'No disease detected. The rice plant appears healthy with no visible signs of infection.',
    treatment: [
      'Continue regular watering and balanced fertilization.',
      'Monitor plants weekly for any early signs of stress.',
      'Maintain good airflow between plants to prevent humidity buildup.',
      'Rotate crops annually to reduce soil-borne disease risk.',
      'Keep field clean and free from weeds.',
    ]
  }
};

// ── DATE HELPERS ──────────────────────────────────────────────────────────
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── PASSWORD HELPERS ──────────────────────────────────────────────────────
export function calcPasswordStrength(pw) {
  let s = 0;
  if (pw.length >= 6)  s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}
export const PW_STRENGTH_LABELS  = ['', 'Weak', 'Fair', 'Good', 'Strong'];
export const PW_STRENGTH_COLORS  = ['', 'var(--red-400)', 'var(--amber-200)', 'var(--teal-400)', 'var(--green-400)'];
export const PW_STRENGTH_CLASSES = ['', 'pw-weak', 'pw-ok', 'pw-good', 'pw-strong'];
