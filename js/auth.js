/*
  Lógica das telas de login e cadastro.

  Por enquanto, os formulários NÃO enviam dados a lugar nenhum — só fazem
  validação no navegador e mostram uma mensagem. Os pontos marcados com
  "TODO FIREBASE" são exatamente onde entra o código do Firebase quando
  configurarmos o Authentication (próximo passo do roteiro).
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

/* ---------- LOGIN ---------- */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const emailField = document.getElementById('loginEmailField');
  const emailInput = document.getElementById('loginEmail');
  const passwordField = document.getElementById('loginPasswordField');
  const passwordInput = document.getElementById('loginPassword');
  const message = document.getElementById('loginMessage');

  const toggleBtn = document.getElementById('loginPasswordToggle');
  if (toggleBtn) setupPasswordToggle(toggleBtn, passwordInput);

  form.addEventListener('submit', (e) => {
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

    // TODO FIREBASE: substituir o bloco abaixo por
    // signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
    //   .then(...) redireciona para paginas/dashboard.html
    //   .catch(...) mostra erro real (senha incorreta, usuário não existe, etc.)
    showMessage(
      message,
      'Formulário validado. A conexão com o login real ainda não foi configurada.',
      'info'
    );
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

  const toggleBtn = document.getElementById('signupPasswordToggle');
  if (toggleBtn) setupPasswordToggle(toggleBtn, passwordInput);

  form.addEventListener('submit', (e) => {
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

    // TODO FIREBASE: substituir o bloco abaixo por
    // createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
    //   .then(...) salva o nome no perfil / Firestore e redireciona para o login ou dashboard
    //   .catch(...) mostra erro real (e-mail já cadastrado, senha fraca, etc.)
    showMessage(
      message,
      'Formulário validado. A conexão com o cadastro real ainda não foi configurada.',
      'info'
    );
  });
}

initLoginForm();
initSignupForm();