import { useState } from 'react';
import useStaff from '../../hooks/useStaff';
import { ROLE_LABEL, login, loginAs, type LoginError } from '../../data/staff';
import { Avatar } from './ui';

const ERRORS: Record<LoginError, string> = {
  credenciais: 'E-mail ou senha incorretos.',
  inativo: 'Esta conta está desativada. Fale com um administrador.',
};

export default function HubLogin() {
  const { accounts } = useStaff();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Informe o e-mail e a senha.');
      return;
    }
    const result = login(email, password);
    if (result) setError(ERRORS[result]);
  }

  const demo = accounts.filter((a) => a.active);

  return (
    <section className="login">
      <div className="login__brand">
        <a href="#/" className="login__back">
          ← Voltar ao site
        </a>
        <div>
          <img src="/assets/levita-icon.png" alt="" className="login__logo" />
          <div className="eyebrow">Área da clínica</div>
          <h1 className="serif">
            O dia a dia da Levitá, <span className="it">num só lugar</span>
          </h1>
          <p>
            Avaliações dos clientes, desempenho da equipe, loja e pedidos. Cada pessoa vê o
            que precisa para o seu trabalho.
          </p>
        </div>
        <ul className="login__features">
          <li>Relatório individual de avaliações</li>
          <li>Gestão da loja e dos pedidos</li>
          <li>Equipe, cargos e permissões</li>
        </ul>
      </div>

      <div className="login__panel">
        <form className="login__form" onSubmit={submit} noValidate>
          <h2 className="serif">Entrar</h2>
          <p className="login__lead">Use o e-mail da clínica para aceder ao HUB.</p>

          <label className="field">
            <span className="field__label">E-mail</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@levita.pt"
            />
          </label>
          <label className="field">
            <span className="field__label">Senha</span>
            <div className="password">
              <input
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShow((v) => !v)}>
                {show ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </label>

          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary btn-block">
            Entrar no HUB
          </button>
          <p className="form-hint login__forgot">Esqueceu a senha? Peça a um administrador para redefinir.</p>
        </form>

        <div className="login__demo">
          <div className="login__demo-head">
            <span className="eyebrow">Acesso de demonstração</span>
            <span className="form-hint">apenas no protótipo</span>
          </div>
          <ul>
            {demo.map((a) => (
              <li key={a.id}>
                <button type="button" onClick={() => loginAs(a.id)}>
                  <Avatar name={a.name} photo={a.photo} size={34} />
                  <span>
                    <strong>{a.name}</strong>
                    <em>{a.title}</em>
                  </span>
                  <span className={`role-badge role-badge--${a.role}`}>{ROLE_LABEL[a.role]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
