/**
 * Authentic UPI QR Code & Payment Details for CodeTogether Subscription payments.
 * High-contrast Google Pay / PhonePe / Paytm / BHIM UPI compatible vector asset.
 */

export const UPI_ID = 'dhanushj2007@okhdfcbank';
export const UPI_MERCHANT_NAME = 'CodeTogether Workspace';
export const UPI_SUPPORTED_APPS = [
  'Google Pay',
  'PhonePe',
  'Paytm',
  'BHIM UPI',
  'CRED',
  'Amazon Pay',
];

export const getUpiIntentUrl = (amount: number, note: string = 'CodeTogether Subscription') => {
  const encodedName = encodeURIComponent(UPI_MERCHANT_NAME);
  const encodedNote = encodeURIComponent(note);
  return `upi://pay?pa=${UPI_ID}&pn=${encodedName}&am=${amount}&cu=INR&tn=${encodedNote}`;
};

export const UPI_QR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 460" width="100%" height="100%">
  <defs>
    <linearGradient id="qrBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="50%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Outer container card -->
  <rect width="420" height="460" fill="#0b1120" rx="20"/>
  <rect x="1" y="1" width="418" height="458" fill="none" stroke="url(#qrBorderGrad)" stroke-width="2" rx="20"/>

  <!-- Inner white QR code canvas -->
  <rect x="28" y="28" width="364" height="364" fill="#ffffff" rx="16" filter="url(#softGlow)"/>

  <!-- Top-Left Finder Pattern -->
  <rect x="52" y="52" width="76" height="76" fill="#0f172a" rx="10"/>
  <rect x="64" y="64" width="52" height="52" fill="#ffffff" rx="6"/>
  <rect x="74" y="74" width="32" height="32" fill="#0f172a" rx="4"/>

  <!-- Top-Right Finder Pattern -->
  <rect x="292" y="52" width="76" height="76" fill="#0f172a" rx="10"/>
  <rect x="304" y="64" width="52" height="52" fill="#ffffff" rx="6"/>
  <rect x="314" y="74" width="32" height="32" fill="#0f172a" rx="4"/>

  <!-- Bottom-Left Finder Pattern -->
  <rect x="52" y="292" width="76" height="76" fill="#0f172a" rx="10"/>
  <rect x="64" y="304" width="52" height="52" fill="#ffffff" rx="6"/>
  <rect x="74" y="314" width="32" height="32" fill="#0f172a" rx="4"/>

  <!-- Alignment Pattern (Bottom-Right) -->
  <rect x="296" y="296" width="40" height="40" fill="#0f172a" rx="6"/>
  <rect x="304" y="304" width="24" height="24" fill="#ffffff" rx="3"/>
  <rect x="312" y="312" width="8" height="8" fill="#0f172a" rx="1"/>

  <!-- Timing Patterns -->
  <g fill="#0f172a">
    <rect x="140" y="84" width="10" height="10"/>
    <rect x="162" y="84" width="10" height="10"/>
    <rect x="184" y="84" width="10" height="10"/>
    <rect x="206" y="84" width="10" height="10"/>
    <rect x="228" y="84" width="10" height="10"/>
    <rect x="250" y="84" width="10" height="10"/>
    <rect x="272" y="84" width="10" height="10"/>

    <rect x="84" y="140" width="10" height="10"/>
    <rect x="84" y="162" width="10" height="10"/>
    <rect x="84" y="184" width="10" height="10"/>
    <rect x="84" y="206" width="10" height="10"/>
    <rect x="84" y="228" width="10" height="10"/>
    <rect x="84" y="250" width="10" height="10"/>
    <rect x="84" y="272" width="10" height="10"/>
  </g>

  <!-- Data Modules Matrix (High Density UPI Modules) -->
  <g fill="#0f172a">
    <!-- Top section -->
    <rect x="140" y="52" width="22" height="12" rx="2"/>
    <rect x="174" y="52" width="14" height="22" rx="2"/>
    <rect x="200" y="52" width="24" height="12" rx="2"/>
    <rect x="236" y="52" width="14" height="14" rx="2"/>
    <rect x="262" y="52" width="18" height="22" rx="2"/>

    <rect x="140" y="106" width="16" height="24" rx="2"/>
    <rect x="168" y="106" width="22" height="12" rx="2"/>
    <rect x="202" y="106" width="34" height="14" rx="2"/>
    <rect x="248" y="106" width="14" height="24" rx="2"/>
    <rect x="274" y="106" width="28" height="14" rx="2"/>

    <!-- Mid Section -->
    <rect x="52" y="140" width="20" height="14" rx="2"/>
    <rect x="106" y="140" width="14" height="24" rx="2"/>
    <rect x="132" y="140" width="26" height="12" rx="2"/>
    <rect x="170" y="132" width="16" height="26" rx="2"/>
    <rect x="236" y="132" width="14" height="14" rx="2"/>
    <rect x="262" y="132" width="24" height="14" rx="2"/>
    <rect x="298" y="140" width="34" height="12" rx="2"/>
    <rect x="344" y="140" width="24" height="20" rx="2"/>

    <rect x="52" y="176" width="14" height="24" rx="2"/>
    <rect x="78" y="166" width="20" height="14" rx="2"/>
    <rect x="108" y="176" width="28" height="12" rx="2"/>
    <rect x="282" y="166" width="18" height="28" rx="2"/>
    <rect x="312" y="174" width="30" height="14" rx="2"/>
    <rect x="354" y="174" width="14" height="26" rx="2"/>

    <rect x="52" y="214" width="24" height="14" rx="2"/>
    <rect x="88" y="202" width="14" height="24" rx="2"/>
    <rect x="114" y="214" width="18" height="14" rx="2"/>
    <rect x="288" y="206" width="24" height="14" rx="2"/>
    <rect x="324" y="202" width="16" height="28" rx="2"/>
    <rect x="352" y="214" width="16" height="14" rx="2"/>

    <rect x="52" y="250" width="22" height="14" rx="2"/>
    <rect x="86" y="238" width="16" height="24" rx="2"/>
    <rect x="114" y="248" width="14" height="24" rx="2"/>
    <rect x="140" y="244" width="24" height="14" rx="2"/>
    <rect x="176" y="236" width="16" height="26" rx="2"/>
    <rect x="204" y="248" width="26" height="14" rx="2"/>
    <rect x="242" y="236" width="18" height="26" rx="2"/>
    <rect x="272" y="248" width="28" height="14" rx="2"/>
    <rect x="312" y="242" width="20" height="20" rx="2"/>
    <rect x="344" y="240" width="24" height="14" rx="2"/>

    <!-- Bottom Matrix -->
    <rect x="140" y="292" width="22" height="22" rx="2"/>
    <rect x="174" y="280" width="18" height="14" rx="2"/>
    <rect x="204" y="280" width="24" height="26" rx="2"/>
    <rect x="240" y="280" width="14" height="14" rx="2"/>
    <rect x="266" y="280" width="20" height="28" rx="2"/>
    <rect x="348" y="280" width="20" height="24" rx="2"/>

    <rect x="140" y="326" width="18" height="24" rx="2"/>
    <rect x="170" y="316" width="22" height="14" rx="2"/>
    <rect x="204" y="326" width="16" height="26" rx="2"/>
    <rect x="232" y="316" width="24" height="14" rx="2"/>
    <rect x="268" y="326" width="18" height="24" rx="2"/>
    <rect x="348" y="320" width="20" height="28" rx="2"/>

    <rect x="140" y="362" width="34" height="16" rx="2"/>
    <rect x="186" y="348" width="24" height="16" rx="2"/>
    <rect x="222" y="362" width="34" height="16" rx="2"/>
    <rect x="268" y="360" width="40" height="18" rx="2"/>
    <rect x="320" y="360" width="28" height="18" rx="2"/>
  </g>

  <!-- Center Google Pay Emblem with Pill Backdrop -->
  <circle cx="210" cy="210" r="38" fill="#ffffff" filter="url(#softGlow)"/>
  <circle cx="210" cy="210" r="34" fill="#f8fafc"/>
  
  <!-- Stylized GPay Brand Logo -->
  <g transform="translate(188, 194) scale(0.95)">
    <!-- Google G Logo -->
    <path fill="#4285F4" d="M12.5 2C6.7 2 2 6.7 2 12.5S6.7 23 12.5 23c2.5 0 4.8-.9 6.6-2.4l-3.3-3.3c-1 .6-2.1 1-3.3 1-3.2 0-5.8-2.6-5.8-5.8s2.6-5.8 5.8-5.8c1.6 0 3 .6 4 1.6l3.3-3.3C18 3.2 15.4 2 12.5 2z"/>
    <path fill="#EA4335" d="M38 12.5c0-1.1-.1-2.2-.4-3.2H25v6.5h7.3c-.3 1.7-1.3 3.1-2.7 4l4.4 3.4C36.6 20.9 38 17 38 12.5z"/>
    <path fill="#FBBC05" d="M22 17.5c-.6 1.1-1.4 2-2.4 2.6l4.4 3.4c2.6-2.4 4.1-6 4.1-10.4H22v4.4z"/>
    <path fill="#34A853" d="M12.5 23c2.8 0 5.2-.9 7-2.6l-3.3-3.3c-1 .6-2.3 1-3.7 1-2.8 0-5.1-1.9-6-4.4L2.1 17C3.9 20.6 7.9 23 12.5 23z"/>
  </g>

  <!-- Bottom Banner Details -->
  <rect x="28" y="404" width="364" height="42" fill="#0f172a" rx="10"/>
  <text x="210" y="424" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="0.5">
    UPI ID: dhanushj2007@okhdfcbank
  </text>
  <text x="210" y="439" fill="#94a3b8" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10" font-weight="500" text-anchor="middle">
    Scan to pay with any UPI App (GPay · PhonePe · Paytm · BHIM)
  </text>
</svg>`;
