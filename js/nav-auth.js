/*
  Roda na landing page (index.html). Se existir uma sessão ativa do
  Supabase, troca os botões "Entrar" / "Criar conta" pelo menu de
  usuário (mesmo componente do dashboard, com um botão extra "Ir para
  a sua central").

  Depende de js/supabase-client.js estar carregado antes.
*/

(async function () {
  const authButtons = document.getElementById('navAuthButtons');
  const userMenu = document.getElementById('navUserMenu');

  if (!authButtons || !userMenu || typeof supabaseClient === 'undefined') return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return; // não logado: mantém os botões padrão

  const user = session.user;
  const fullName = (user.user_metadata && user.user_metadata.full_name) || '';
  const displayName = fullName || user.email;
  const firstName = displayName.split(' ')[0];

  document.getElementById('navAccountFirstName').textContent = firstName;
  document.getElementById('navAccountName').textContent = displayName;
  document.getElementById('navAccountEmail').textContent = user.email;
  const avatarEl = document.getElementById('navAccountAvatar');
  const avatarUrl = user.user_metadata && user.user_metadata.avatar_url;
  if (avatarUrl) {
    avatarEl.innerHTML = '<img src="' + avatarUrl + '" alt="" style="width:100%;height:100%;object-fit:cover;">';
  } else {
    avatarEl.textContent = displayName.trim().charAt(0).toUpperCase();
  }

  authButtons.style.display = 'none';
  userMenu.style.display = '';

  const trigger = document.getElementById('navUserMenuTrigger');

  function closeMenu() {
    userMenu.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = userMenu.classList.toggle('open');
    trigger.setAttribute('aria-expanded', String(isOpen));
  });
  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  const logoutBtn = document.getElementById('navLogoutBtn');
  logoutBtn.addEventListener('click', async () => {
    logoutBtn.disabled = true;
    await supabaseClient.auth.signOut();
    window.location.reload();
  });
})();
