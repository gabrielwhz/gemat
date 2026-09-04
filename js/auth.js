/*
  Lógica das telas de login e cadastro, usando Supabase Auth.

  Depende de js/supabase-client.js estar carregado ANTES deste arquivo
  (ele expõe a variável global `supabaseClient`).
*/

function showMessage(el, text, type) {
  el.textContent = text;
  el.className = 'auth-form-message show ' + type;
}

function clearFieldError(fieldEl) {
  fieldEl.classList.remove('has-error');
}

function setFieldError(fieldEl, message) {
  fieldEl.classList.add('has-error');
  const errorEl = fieldEl.querySelector('.field-error');
  if (errorEl) errorEl.textContent = message;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function setupPasswordToggle(buttonEl, inputEl) {
  buttonEl.addEventListener('click', () => {
    const isHidden = inputEl.type === 'password';
    inputEl.type = isHidden ? 'text' : 'password';
    buttonEl.textContent = isHidden ? 'ocultar' : 'mostrar';
  });
}

// Traduz as mensagens de erro mais comuns do Supabase Auth para PT-BR
function traduzErroSupabase(error) {
  const msg = (error && error.message) || '';
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (msg.includes('User already registered')) return 'Já existe uma conta com esse e-mail.';
  if (msg.includes('Password should be at least')) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (msg.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar (verifique sua caixa de entrada).';
  if (msg.includes('rate limit')) return 'Muitas tentativas seguidas. Aguarde um instante e tente de novo.';
  return 'Não foi possível concluir. Tente novamente em instantes.';
}

function setLoading(button, isLoading, defaultText, loadingText) {
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : defaultText;
}

/* ---------- LOGIN ---------- */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const emailField = document.getElementById('loginEmailField');
  const emailInput = document.getElementById('loginEmail');
  const passwordField = document.getElementById('loginPasswordField');
  const passwordInput = document.getElementById('loginPassword');
  const message = document.getElementById('loginMessage');
  const submitBtn = form.querySelector('.auth-submit');

  const toggleBtn = document.getElementById('loginPasswordToggle');
  if (toggleBtn) setupPasswordToggle(toggleBtn, passwordInput);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldError(emailField);
    clearFieldError(passwordField);

    let hasError = false;
    if (!isValidEmail(emailInput.value.trim())) {
      setFieldError(emailField, 'Digite um e-mail válido.');
      hasError = true;
    }
    if (passwordInput.value.length < 6) {
      setFieldError(passwordField, 'A senha precisa ter pelo menos 6 caracteres.');
      hasError = true;
    }
    if (hasError) return;

    setLoading(submitBtn, true, 'Entrar', 'Entrando...');

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: emailInput.value.trim(),
        password: passwordInput.value
      });

      if (error) {
        showMessage(message, traduzErroSupabase(error), 'error');
        return;
      }

      // Login OK — redireciona para a central de dados.
      // (dashboard.html ainda não existe: será criado no próximo passo do roteiro)
      window.location.href = 'dashboard.html';
    } catch (err) {
      console.error('Erro inesperado no login:', err);
      showMessage(
        message,
        'Não foi possível conectar ao Supabase. Confira o console (F12) e se a URL/chave em supabase-client.js estão corretas.',
        'error'
      );
    } finally {
      setLoading(submitBtn, false, 'Entrar', 'Entrando...');
    }
  });
}

/* ---------- CADASTRO ---------- */
function initSignupForm() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  const nameField = document.getElementById('signupNameField');
  const nameInput = document.getElementById('signupName');
  const emailField = document.getElementById('signupEmailField');
  const emailInput = document.getElementById('signupEmail');
  const passwordField = document.getElementById('signupPasswordField');
  const passwordInput = document.getElementById('signupPassword');
  const confirmField = document.getElementById('signupConfirmField');
  const confirmInput = document.getElementById('signupConfirm');
  const message = document.getElementById('signupMessage');
  const submitBtn = form.querySelector('.auth-submit');

  const toggleBtn = document.getElementById('signupPasswordToggle');
  if (toggleBtn) setupPasswordToggle(toggleBtn, passwordInput);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    [nameField, emailField, passwordField, confirmField].forEach(clearFieldError);

    let hasError = false;
    if (nameInput.value.trim().length < 2) {
      setFieldError(nameField, 'Digite seu nome.');
      hasError = true;
    }
    if (!isValidEmail(emailInput.value.trim())) {
      setFieldError(emailField, 'Digite um e-mail válido.');
      hasError = true;
    }
    if (passwordInput.value.length < 6) {
      setFieldError(passwordField, 'A senha precisa ter pelo menos 6 caracteres.');
      hasError = true;
    }
    if (confirmInput.value !== passwordInput.value) {
      setFieldError(confirmField, 'As senhas não coincidem.');
      hasError = true;
    }
    if (hasError) return;

    setLoading(submitBtn, true, 'Criar conta', 'Criando conta...');

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: emailInput.value.trim(),
        password: passwordInput.value,
        options: {
          data: { full_name: nameInput.value.trim() }
        }
      });

      if (error) {
        showMessage(message, traduzErroSupabase(error), 'error');
        return;
      }

      // Por padrão, o Supabase exige confirmação por e-mail antes do primeiro login.
      showMessage(
        message,
        'Conta criada! Verifique seu e-mail para confirmar antes de entrar.',
        'info'
      );
      form.reset();
    } catch (err) {
      console.error('Erro inesperado no cadastro:', err);
      showMessage(
        message,
        'Não foi possível conectar ao Supabase. Confira o console (F12) e se a URL/chave em supabase-client.js estão corretas.',
        'error'
      );
    } finally {
      setLoading(submitBtn, false, 'Criar conta', 'Criando conta...');
    }
  });
}

/* ---------- ALTERNAR ENTRE SENHA / LINK MÁGICO ---------- */
function initModeToggle() {
  const passwordBtn = document.getElementById('modePasswordBtn');
  const magicBtn = document.getElementById('modeMagicBtn');
  const loginForm = document.getElementById('loginForm');
  const magicForm = document.getElementById('magicLinkForm');
  if (!passwordBtn || !magicBtn || !loginForm || !magicForm) return;

  passwordBtn.addEventListener('click', () => {
    passwordBtn.classList.add('active');
    passwordBtn.setAttribute('aria-selected', 'true');
    magicBtn.classList.remove('active');
    magicBtn.setAttribute('aria-selected', 'false');
    loginForm.style.display = '';
    magicForm.style.display = 'none';
  });

  magicBtn.addEventListener('click', () => {
    magicBtn.classList.add('active');
    magicBtn.setAttribute('aria-selected', 'true');
    passwordBtn.classList.remove('active');
    passwordBtn.setAttribute('aria-selected', 'false');
    loginForm.style.display = 'none';
    magicForm.style.display = '';
  });
}

/* ---------- LINK MÁGICO ---------- */
function initMagicLinkForm() {
  const form = document.getElementById('magicLinkForm');
  if (!form) return;

  const emailField = document.getElementById('magicEmailField');
  const emailInput = document.getElementById('magicEmail');
  const message = document.getElementById('magicMessage');
  const submitBtn = form.querySelector('.auth-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldError(emailField);

    if (!isValidEmail(emailInput.value.trim())) {
      setFieldError(emailField, 'Digite um e-mail válido.');
      return;
    }

    setLoading(submitBtn, true, 'Enviar link mágico', 'Enviando...');

    try {
      const redirectTo = window.location.origin + window.location.pathname.replace('login.html', 'dashboard.html');
      const { error } = await supabaseClient.auth.signInWithOtp({
        email: emailInput.value.trim(),
        options: { emailRedirectTo: redirectTo }
      });

      if (error) {
        showMessage(message, traduzErroSupabase(error), 'error');
        return;
      }

      showMessage(message, 'Link enviado! Verifique seu e-mail para entrar (confira o spam também).', 'info');
      form.reset();
    } catch (err) {
      console.error('Erro inesperado no link mágico:', err);
      showMessage(
        message,
        'Não foi possível conectar ao Supabase. Confira o console (F12).',
        'error'
      );
    } finally {
      setLoading(submitBtn, false, 'Enviar link mágico', 'Enviando...');
    }
  });
}

initLoginForm();
initSignupForm();
initModeToggle();
initMagicLinkForm();
