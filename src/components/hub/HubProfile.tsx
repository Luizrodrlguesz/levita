import { useState } from 'react';
import {
  ROLE_LABEL,
  changePassword,
  emailTaken,
  updateAccount,
  type StaffAccount,
} from '../../data/staff';
import { Card, PhotoInput } from './ui';

export default function HubProfile({ account }: { account: StaffAccount }) {
  return (
    <div className="dash-grid dash-grid--profile">
      <ProfileForm key={account.id} account={account} />
      <PasswordForm account={account} />
    </div>
  );
}

function ProfileForm({ account }: { account: StaffAccount }) {
  const [form, setForm] = useState({
    name: account.name,
    email: account.email,
    phone: account.phone,
    photo: account.photo,
  });
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const dirty =
    form.name !== account.name ||
    form.email !== account.email ||
    form.phone !== account.phone ||
    form.photo !== account.photo;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setFeedback({ ok: false, text: 'O nome não pode ficar vazio.' });
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setFeedback({ ok: false, text: 'Confira o e-mail.' });
    if (emailTaken(form.email, account.id)) {
      return setFeedback({ ok: false, text: 'Este e-mail já é usado por outra conta.' });
    }
    updateAccount(account.id, {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      photo: form.photo,
    });
    setFeedback({ ok: true, text: 'Perfil atualizado.' });
  }

  return (
    <Card title="Informações pessoais">
      <form className="stack" onSubmit={submit} noValidate>
        <PhotoInput name={form.name} value={form.photo} onChange={(photo) => setForm((f) => ({ ...f, photo }))} />
        <div className="new-review__cols">
          <label className="field">
            <span className="field__label">Nome</span>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label className="field">
            <span className="field__label">E-mail de acesso</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </label>
          <label className="field">
            <span className="field__label">Telemóvel</span>
            <input
              value={form.phone}
              placeholder="+351"
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </label>
        </div>

        <dl className="profile-meta">
          <div>
            <dt>Cargo</dt>
            <dd>{account.title}</dd>
          </div>
          <div>
            <dt>Permissão</dt>
            <dd>
              <span className={`role-badge role-badge--${account.role}`}>{ROLE_LABEL[account.role]}</span>
            </dd>
          </div>
          <div>
            <dt>Perfil público</dt>
            <dd>{account.professionalId ? 'Recebe avaliações de clientes' : 'Conta só de gestão'}</dd>
          </div>
        </dl>
        <p className="form-hint">Cargo e permissão são definidos por um administrador.</p>

        {feedback && <p className={feedback.ok ? 'form-ok' : 'form-error'}>{feedback.text}</p>}
        <button type="submit" className="btn-primary" disabled={!dirty}>
          Salvar alterações
        </button>
      </form>
    </Card>
  );
}

function PasswordForm({ account }: { account: StaffAccount }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 8) return setFeedback({ ok: false, text: 'A nova senha precisa de pelo menos 8 caracteres.' });
    if (next !== confirm) return setFeedback({ ok: false, text: 'A confirmação não confere.' });
    if (!changePassword(account.id, current, next)) {
      return setFeedback({ ok: false, text: 'A senha atual está incorreta.' });
    }
    setCurrent('');
    setNext('');
    setConfirm('');
    setFeedback({ ok: true, text: 'Senha alterada.' });
  }

  return (
    <Card title="Senha">
      <form className="stack" onSubmit={submit} noValidate>
        <label className="field">
          <span className="field__label">Senha atual</span>
          <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Nova senha</span>
          <input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Confirmar nova senha</span>
          <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
        {feedback && <p className={feedback.ok ? 'form-ok' : 'form-error'}>{feedback.text}</p>}
        <button type="submit" className="btn-ghost" disabled={!current || !next}>
          Alterar senha
        </button>
      </form>
    </Card>
  );
}
