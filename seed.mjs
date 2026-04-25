/**
 * seed.mjs — Script para crear 3 campañas de demo en el backend de Analitika
 * 
 * USO:
 *   node seed.mjs
 *
 * ⚠️  Ajusta BASE_URL y las credenciales si es necesario.
 */

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BASE_URL = 'http://192.168.56.1:3000';   // ← cambia el puerto si no es 3000
const EMAIL = ''; // ← Ingresa tu email de administrador
const PASSWORD = ''; // ← Ingresa tu contraseña

// ─── Campañas de demo ─────────────────────────────────────────────────────────
const CAMPAIGNS = [
  {
    name: 'Lanzamiento Verano 2026',
    description: 'Campaña de temporada para productos de verano en Instagram y TikTok.',
    canal: 'Instagram',
    start_date: '2026-04-01',
    end_date: '2026-06-30',
    status: 'active',
    spent: 1500000,
    budget: 2000000,
    return_expected: 6000000,
    destination_url: 'https://ejemplo.com/verano',
  },
  {
    name: 'Black Friday Analitika',
    description: 'Promoción especial de descuentos para el Black Friday vía Facebook Ads.',
    canal: 'Facebook',
    start_date: '2026-11-20',
    end_date: '2026-11-30',
    status: 'active',
    spent: 850000,
    budget: 1200000,
    return_expected: 4500000,
    destination_url: 'https://ejemplo.com/blackfriday',
  },
  {
    name: 'Captación WhatsApp Q2',
    description: 'Campaña de captación de leads mediante difusión por WhatsApp Business.',
    canal: 'WhatsApp',
    start_date: '2026-04-15',
    end_date: '2026-06-15',
    status: 'active',
    spent: 300000,
    budget: 500000,
    return_expected: 1800000,
    destination_url: 'https://ejemplo.com/whatsapp-q2',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(`[${res.status}] ${path} → ${JSON.stringify(data)}`);
  }
  return data;
}

function green(t) { return `\x1b[32m${t}\x1b[0m`; }
function yellow(t) { return `\x1b[33m${t}\x1b[0m`; }
function red(t) { return `\x1b[31m${t}\x1b[0m`; }
function bold(t) { return `\x1b[1m${t}\x1b[0m`; }

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log(bold('\n🚀  Analitika — Seed de campañas de demo\n'));

  // 1️⃣  Login
  console.log(`🔑  Autenticando como ${yellow(EMAIL)} …`);
  let token;
  try {
    const loginRes = await post('/auth/login', { email: EMAIL, password: PASSWORD });
    token = loginRes.token;
    console.log(green(`✓  Login exitoso (token: ${token.slice(0, 16)}…)\n`));
  } catch (err) {
    console.error(red(`✗  Login fallido: ${err.message}`));
    console.log(yellow(`\n   Asegúrate de que BASE_URL = ${BASE_URL} es correcta y el backend está corriendo.\n`));
    process.exit(1);
  }

  // 2️⃣  Crear campañas + tracking links
  const results = [];

  for (const [i, camp] of CAMPAIGNS.entries()) {
    const { destination_url, ...campaignPayload } = camp;
    const num = `[${i + 1}/${CAMPAIGNS.length}]`;
    process.stdout.write(`${num}  Creando campaña "${yellow(camp.name)}" … `);

    try {
      // Crear campaña
      const created = await post('/campaigns', campaignPayload, token);
      process.stdout.write(green('✓ campaña  '));

      // Crear tracking link
      let link = null;
      try {
        link = await post('/tracking-links', {
          id_campaign: created.id_campaign,
          destination_url,
        }, token);
        process.stdout.write(green('✓ tracking link\n'));
      } catch (linkErr) {
        process.stdout.write(yellow(`⚠ tracking link falló (${linkErr.message})\n`));
      }

      results.push({ campaign: created, link });

    } catch (campErr) {
      process.stdout.write(red(`✗ ${campErr.message}\n`));
    }
  }

  // 3️⃣  Resumen
  console.log(bold('\n─── Resumen ──────────────────────────────────────────────'));
  for (const { campaign, link } of results) {
    const roi = campaign.return_expected && campaign.budget
      ? (((campaign.return_expected - campaign.budget) / campaign.budget) * 100).toFixed(0)
      : null;

    console.log(`
  📣  ${bold(campaign.name)}
      ID campaña : ${campaign.id_campaign}
      Canal      : ${campaign.canal ?? '—'}
      Estado     : ${campaign.status}
      Presupuesto: $${(campaign.budget ?? 0).toLocaleString('es-CO')} COP
      ROI esp.   : ${roi ? `${roi}%` : '—'}
      Link ID    : ${link ? link.id_link : '—'}
      Link URL   : ${link ? green(link.url ?? `${BASE_URL}/track/${link.id_link}`) : yellow('no generado')}`);
  }

  console.log(bold('\n✅  ¡Seed completado! Recarga la app para ver las campañas.\n'));
})();
