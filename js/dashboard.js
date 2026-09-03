/*
  Lógica da central (dashboard.html).

  Depende de js/supabase-client.js estar carregado antes (expõe `supabaseClient`).
*/

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function fmtLeitura(leitura, key, unit) {
  if (!leitura || leitura[key] === null || leitura[key] === undefined) return '—';
  return leitura[key] + unit;
}

function renderPrototipoCard(prototipo, leitura) {
  const card = document.createElement('div');
  card.className = 'dash-mock';

  const hasLeitura = !!leitura;

  card.innerHTML = `
    <div class="dash-topbar">
      <div class="title">${escapeHtml(prototipo.apelido)}</div>
      <div class="pill${hasLeitura ? '' : ' pill-muted'}">${hasLeitura ? 'com dados' : 'sem leituras ainda'}</div>
    </div>
    <div class="dash-cards">
      <div class="dash-card"><div class="k">PM2.5</div><div class="v mono">${fmtLeitura(leitura, 'pm25', ' µg/m³')}</div></div>
      <div class="dash-card"><div class="k">PM10</div><div class="v mono">${fmtLeitura(leitura, 'pm10', ' µg/m³')}</div></div>
      <div class="dash-card"><div class="k">SO₂</div><div class="v mono">${fmtLeitura(leitura, 'so2', ' ppb')}</div></div>
      <div class="dash-card"><div class="k">NOₓ</div><div class="v mono">${fmtLeitura(leitura, 'nox', ' ppb')}</div></div>
    </div>
    <div class="dash-footer-code">Código do dispositivo: ${escapeHtml(prototipo.codigo_dispositivo)}</div>
  `;
  return card;
}

function setupUserMenu() {
  const userMenu = document.getElementById('userMenu');
  const trigger = document.getElementById('userMenuTrigger');
  if (!userMenu || !trigger) return;

  function closeMenu() {
    userMenu.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  }
  function toggleMenu() {
    const isOpen = userMenu.classList.toggle('open');
    trigger.setAttribute('aria-expanded', String(isOpen));
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });
  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

async function loadDashboard() {
  const welcomeTitle = document.getElementById('welcomeTitle');
  const accountAvatar = document.getElementById('accountAvatar');
  const accountFirstName = document.getElementById('accountFirstName');
  const accountName = document.getElementById('accountName');
  const accountEmail = document.getElementById('accountEmail');
  const logoutBtn = document.getElementById('logoutBtn');
  const prototiposList = document.getElementById('prototiposList');
  const emptyState = document.getElementById('emptyState');
  const errorState = document.getElementById('errorState');

  setupUserMenu();

  // 1. Confere se tem usuário logado. Sem sessão, manda pro login.
  const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

  if (sessionError || !session) {
    window.location.href = 'login.html';
    return;
  }

  const user = session.user;
  const fullName = (user.user_metadata && user.user_metadata.full_name) || '';
  const displayName = fullName || user.email;
  const firstName = displayName.split(' ')[0];

  welcomeTitle.textContent = 'Olá, ' + firstName;
  accountFirstName.textContent = firstName;
  accountName.textContent = displayName;
  accountEmail.textContent = user.email;
  accountAvatar.textContent = displayName.trim().charAt(0).toUpperCase();

  // 2. Botão de sair
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      logoutBtn.disabled = true;
      await supabaseClient.auth.signOut();
      window.location.href = 'login.html';
    });
  }

  // 3. Busca os protótipos do usuário
  // (RLS já garante que só vêm os protótipos com dono_id = usuário logado)
  const { data: prototipos, error: prototiposError } = await supabaseClient
    .from('prototipos')
    .select('*')
    .order('criado_em', { ascending: false });

  if (prototiposError) {
    console.error('Erro ao buscar protótipos:', prototiposError);
    errorState.style.display = 'block';
    return;
  }

  if (!prototipos || prototipos.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  // 4. Para cada protótipo, busca a leitura mais recente
  for (const prototipo of prototipos) {
    const { data: leitura, error: leituraError } = await supabaseClient
      .from('leituras')
      .select('*')
      .eq('prototipo_id', prototipo.id)
      .order('medido_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (leituraError) console.error('Erro ao buscar leitura de', prototipo.apelido, leituraError);

    prototiposList.appendChild(renderPrototipoCard(prototipo, leitura));
  }
}

loadDashboard();
