import { useState } from 'react';
import useStaff from '../../hooks/useStaff';
import useReviews from '../../hooks/useReviews';
import { navigate } from '../../hooks/useRoute';
import { statsFor } from '../../data/reviews';
import {
  ROLE_LABEL,
  addStaff,
  emailTaken,
  removeStaff,
  resetPassword,
  setRole,
  toggleStaff,
  updateAccount,
  type StaffAccount,
  type StaffRole,
} from '../../data/staff';
import type { SitePlacement } from '../../data/reviews';
import { formatScore } from '../Avaliar';
import { ActionsMenu, Avatar, Card, Crumbs, PhotoInput } from './ui';

const LAST_ADMIN = 'A clínica precisa de pelo menos um administrador ativo.';

export default function HubTeam({ me, sub }: { me: StaffAccount; sub?: string }) {
  const { accounts } = useStaff();
  if (sub === 'novo') return <StaffEditor key="novo" me={me} />;
  if (sub) {
    const account = accounts.find((a) => a.id === sub);
    return account ? (
      <StaffEditor key={account.id} me={me} account={account} />
    ) : (
      <Card>
        <div className="panel-empty">
          Funcionário não encontrado. <a href="#/hub/equipe">Voltar à equipe</a>
        </div>
      </Card>
    );
  }
  return <StaffList me={me} />;
}

function StaffList({ me }: { me: StaffAccount }) {
  const { accounts } = useStaff();
  const { reviews } = useReviews();
  const [notice, setNotice] = useState('');
  const published = reviews.filter((r) => r.status === 'publicada');
  const guard = (ok: boolean) => setNotice(ok ? '' : LAST_ADMIN);

  return (
    <Card
      title="Funcionários"
      aside={
        <a className="btn-primary btn-sm" href="#/hub/equipe/novo">
          + Novo funcionário
        </a>
      }
    >
      {notice && <p className="form-error">{notice}</p>}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Pessoa</th>
              <th>Cargo</th>
              <th>Permissão</th>
              <th>Avaliação</th>
              <th>Status</th>
              <th className="col-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => {
              const stats = a.professionalId
                ? statsFor(published.filter((r) => r.professionalId === a.professionalId))
                : null;
              const self = a.id === me.id;
              return (
                <tr key={a.id} className={a.active ? '' : 'is-off'}>
                  <td>
                    <a className="cell-person cell-link" href={`#/hub/equipe/${a.id}`}>
                      <Avatar name={a.name} photo={a.photo} size={38} />
                      <div>
                        <strong>
                          {a.name}
                          {self && <em> (você)</em>}
                        </strong>
                        <span>{a.email}</span>
                      </div>
                    </a>
                  </td>
                  <td>{a.title}</td>
                  <td>
                    <span className={`role-badge role-badge--${a.role}`}>{ROLE_LABEL[a.role]}</span>
                  </td>
                  <td>
                    {stats ? (
                      <span className="cell-score">
                        <strong>{formatScore(stats.average)}</strong>
                        <span className="hub-card__count">{stats.count} aval.</span>
                      </span>
                    ) : (
                      <span className="hub-card__count">gestão</span>
                    )}
                  </td>
                  <td>
                    <span className={`status ${a.active ? 'status--publicada' : 'status--oculta'}`}>
                      {a.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="col-actions">
                    <ActionsMenu
                      label={a.name}
                      actions={[
                        { label: 'Editar', onSelect: () => navigate(`/hub/equipe/${a.id}`) },
                        ...(self
                          ? []
                          : [
                              {
                                label: a.active ? 'Desativar acesso' : 'Reativar acesso',
                                onSelect: () => guard(toggleStaff(a.id)),
                              },
                              {
                                label: 'Remover',
                                confirm: 'Confirmar remoção',
                                danger: true,
                                onSelect: () => guard(removeStaff(a.id)),
                              },
                            ]),
                      ]}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="form-hint">
        Desativar bloqueia o acesso ao HUB e tira a pessoa da página pública de avaliação. Remover
        apaga também as avaliações ligadas a ela.
      </p>
    </Card>
  );
}

const PLACEMENTS: { key: SitePlacement; label: string; hint: string }[] = [
  { key: 'equipe', label: 'Nossa equipe', hint: 'Card na seção "Nossa equipe" da página inicial.' },
  { key: 'fundadora', label: 'Destaque da fundadora', hint: 'Texto e foto principais de "Sobre a Levitá".' },
  { key: 'oculto', label: 'Não aparece no site', hint: 'Continua na página de avaliação, se estiver ativa.' },
];

const DESCRIPTION_MAX = 220;

/** Tela única para criar (`#/hub/equipe/novo`) e editar (`#/hub/equipe/:id`). */
function StaffEditor({ me, account }: { me: StaffAccount; account?: StaffAccount }) {
  const isNew = !account;
  const { professionals } = useReviews();
  const pro = professionals.find((p) => p.id === account?.professionalId);
  const [form, setForm] = useState({
    name: account?.name ?? '',
    title: account?.title ?? '',
    email: account?.email ?? '',
    phone: account?.phone ?? '',
    photo: account?.photo ?? '',
    role: account?.role ?? ('equipe' as StaffRole),
    attends: true,
    password: '',
    description: pro?.description ?? '',
    site: pro?.site ?? ('equipe' as SitePlacement),
  });
  const [error, setError] = useState('');
  const back = () => navigate('/hub/equipe');
  // perfil público existe (ou vai existir, ao criar com "atende clientes")
  const hasPublic = isNew ? form.attends : Boolean(pro);
  const founderTaken = professionals.find((p) => p.site === 'fundadora' && p.active && p.id !== pro?.id);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return setError('Nome e e-mail são obrigatórios.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Confira o e-mail.');
    if (emailTaken(form.email, account?.id)) return setError('Já existe uma conta com este e-mail.');
    if (hasPublic && !form.title.trim()) return setError('Informe o cargo que aparece no site.');
    if (hasPublic && form.site !== 'oculto' && !form.description.trim()) {
      return setError('Escreva a descrição que aparece no site, ou escolha "Não aparece no site".');
    }
    if (isNew && form.password.length < 8) return setError('A senha inicial precisa de pelo menos 8 caracteres.');
    if (!isNew && form.password && form.password.length < 8) {
      return setError('A nova senha precisa de pelo menos 8 caracteres.');
    }

    const title = form.title.trim() || 'Gestão';
    const description = form.description.trim();
    if (isNew) {
      addStaff({ ...form, name: form.name.trim(), title, description });
      return back();
    }
    if (form.role !== account.role && !setRole(account.id, form.role)) return setError(LAST_ADMIN);
    updateAccount(account.id, {
      name: form.name.trim(),
      title,
      email: form.email.trim(),
      phone: form.phone.trim(),
      photo: form.photo,
      ...(pro && { description, site: form.site }),
    });
    if (form.password) resetPassword(account.id, form.password);
    back();
  }

  return (
    <>
      <Crumbs to="#/hub/equipe" section="Equipe" page={isNew ? 'Novo funcionário' : account.name} />
      <form className="dash-grid dash-grid--profile" onSubmit={submit} noValidate>
        <div className="stack">
          <Card title="Dados pessoais">
            <div className="stack">
              <PhotoInput name={form.name} value={form.photo} onChange={(v) => set('photo', v)} />
              <div className="new-review__cols">
                <label className="field">
                  <span className="field__label">Nome completo</span>
                  <input value={form.name} onChange={(e) => set('name', e.target.value)} />
                </label>
                <label className="field">
                  <span className="field__label">E-mail de acesso</span>
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="nome@levita.pt" />
                </label>
                <label className="field">
                  <span className="field__label">Telemóvel</span>
                  <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+351" />
                </label>
                {!hasPublic && (
                  <label className="field">
                    <span className="field__label">Cargo</span>
                    <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Gestão, Recepção…" />
                  </label>
                )}
              </div>
              {isNew && (
                <label className="check">
                  <input type="checkbox" checked={form.attends} onChange={(e) => set('attends', e.target.checked)} />
                  <span>Atende clientes (recebe avaliações e pode aparecer no site)</span>
                </label>
              )}
            </div>
          </Card>

          {hasPublic ? (
            <Card title="Perfil no site" aside={<span className="hub-card__count">página inicial e avaliação</span>}>
              <div className="stack">
                <label className="field">
                  <span className="field__label">Cargo</span>
                  <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Terapeuta Corporal" />
                </label>
                <label className="field">
                  <span className="field__label">Descrição — o que a pessoa faz</span>
                  <textarea
                    rows={4}
                    maxLength={DESCRIPTION_MAX}
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder="Especialidades, técnicas e o cuidado que oferece em cada sessão."
                  />
                  <span className="form-hint field__count">
                    {form.description.length}/{DESCRIPTION_MAX}
                  </span>
                </label>
                <div className="field">
                  <span className="field__label">Exibição no site</span>
                  <div className="choice-row">
                    {PLACEMENTS.map((p) => (
                      <button
                        type="button"
                        key={p.key}
                        className={`choice ${form.site === p.key ? 'is-active' : ''}`}
                        aria-pressed={form.site === p.key}
                        onClick={() => set('site', p.key)}
                      >
                        <span className="choice__dot" />
                        <span>
                          <strong>{p.label}</strong>
                          <em>{p.hint}</em>
                        </span>
                      </button>
                    ))}
                  </div>
                  {form.site === 'fundadora' && founderTaken && (
                    <p className="form-hint">
                      {founderTaken.name} já está no destaque; o site mostra quem vier primeiro na lista.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            !isNew && (
              <Card>
                <p className="form-hint">Conta só de gestão: não aparece no site nem na página de avaliação.</p>
              </Card>
            )
          )}
        </div>

        <div className="stack">
          {hasPublic && (
            <Card title="Prévia no site">
              {form.site === 'oculto' ? (
                <p className="form-hint">Não aparece na página inicial.</p>
              ) : form.site === 'fundadora' ? (
                <div className="site-preview site-preview--founder">
                  <p>
                    Por trás da Levitá está <strong>{form.name || 'Nome'}</strong>. {form.description || 'Descrição…'}
                  </p>
                  <span className="name">{form.name || 'Nome'}</span>
                  <span className="role">{form.title || 'Cargo'}</span>
                </div>
              ) : (
                <div className="site-preview about__staff-card">
                  <div className="about__staff-photo">
                    {form.photo ? <img src={form.photo} alt="" /> : <Avatar name={form.name || '?'} photo="" size={120} />}
                  </div>
                  <span className="about__staff-name">{form.name || 'Nome'}</span>
                  <span className="about__staff-role">{form.title || 'Cargo'}</span>
                  <p className="about__staff-desc">{form.description || 'Descrição…'}</p>
                </div>
              )}
              {!isNew && form.site !== 'oculto' && (
                <a className="link-arrow site-preview__link" href="#sobre" target="_blank" rel="noreferrer">
                  Ver na página inicial ↗
                </a>
              )}
            </Card>
          )}

          <Card title="Acesso">
            <div className="stack">
              <label className="field">
                <span className="field__label">Permissão</span>
                <select value={form.role} onChange={(e) => set('role', e.target.value as StaffRole)}>
                  <option value="equipe">Equipe — painel simples</option>
                  <option value="admin">Administrador — acesso total</option>
                </select>
              </label>
              <label className="field">
                <span className="field__label">{isNew ? 'Senha inicial' : 'Redefinir senha'}</span>
                <input
                  type="text"
                  autoComplete="off"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder={isNew ? 'mínimo 8 caracteres' : 'deixe em branco para manter'}
                />
              </label>
              {!isNew && account.id === me.id && <p className="form-hint">Esta é a sua conta.</p>}
            </div>
          </Card>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={back}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {isNew ? 'Criar conta' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
