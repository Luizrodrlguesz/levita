/**
 * Contas da equipe, cargos e sessão do HUB.
 *
 * PROTÓTIPO: contas, senhas e sessão vivem no localStorage do navegador e as
 * permissões são aplicadas só na interface. Serve para apresentar o fluxo;
 * em produção isto passa para um backend com senhas cifradas e sessão no
 * servidor. Os componentes só usam as funções deste arquivo.
 *
 * Contas de exemplo: e-mail `<primeiro-nome>@levita.pt` e senha
 * `SEED_PASSWORD` (abaixo). Também dá para entrar pelo "acesso de
 * demonstração" da tela de login.
 */

import {
  addProfessional,
  getState as getReviews,
  removeProfessional,
  resetStore as resetReviews,
  toggleProfessional,
  updateProfessional,
  type SitePlacement,
} from './reviews';
import { resetShop } from './shop';

const STORAGE_KEY = 'levita.staff.v1';
const SESSION_KEY = 'levita.session.v1';

const SEED_PASSWORD = 'levita2026';

export type StaffRole = 'admin' | 'equipe';

export const ROLE_LABEL: Record<StaffRole, string> = {
  admin: 'Administrador',
  equipe: 'Equipe',
};

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: StaffRole;
  /** cargo exibido; para quem atende é o mesmo da LP (vem do perfil público) */
  title: string;
  phone: string;
  /** URL ou data URL; vazio = iniciais */
  photo: string;
  active: boolean;
  /** perfil público avaliado pelos clientes; `null` para contas só de gestão */
  professionalId: string | null;
}

export interface StaffState {
  accounts: StaffAccount[];
  sessionId: string | null;
}

/* ---------- seed ---------- */

const ADMIN_PROFESSIONALS = new Set(['lucas']);

function emailFor(name: string) {
  const first = name
    .split(' ')[0]
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  return `${first}@levita.pt`;
}

function accountFromProfessional(pro: {
  id: string;
  name: string;
  role: string;
  photo: string;
  active: boolean;
}): StaffAccount {
  return {
    id: `acc-${pro.id}`,
    name: pro.name,
    email: emailFor(pro.name),
    password: SEED_PASSWORD,
    role: ADMIN_PROFESSIONALS.has(pro.id) ? 'admin' : 'equipe',
    title: pro.role,
    phone: '',
    photo: pro.photo,
    active: pro.active,
    professionalId: pro.id,
  };
}

function seedAccounts(): StaffAccount[] {
  return [
    {
      id: 'acc-luiz',
      name: 'Luiz Rodrigues',
      email: 'luiz@levita.pt',
      password: SEED_PASSWORD,
      role: 'admin',
      title: 'Gestão',
      phone: '',
      photo: '',
      active: true,
      professionalId: null,
    },
    ...getReviews().professionals.map(accountFromProfessional),
  ];
}

/**
 * Garante uma conta para cada profissional (ex.: cadastrados antes do login
 * existir) e alinha o cargo das contas com o perfil público — a fonte é o
 * `Professional`, que é o que a LP mostra.
 */
function withProfessionals(accounts: StaffAccount[]): StaffAccount[] {
  const { professionals } = getReviews();
  const synced = accounts.map((a) => {
    const pro = professionals.find((p) => p.id === a.professionalId);
    return pro && pro.role !== a.title ? { ...a, title: pro.role } : a;
  });
  const missing = professionals
    .filter((p) => !accounts.some((a) => a.professionalId === p.id))
    .map(accountFromProfessional);
  return [...synced, ...missing];
}

/* ---------- store ---------- */

function load(): StaffState {
  let accounts: StaffAccount[];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as StaffAccount[]) : null;
    accounts = Array.isArray(parsed) && parsed.length ? withProfessionals(parsed) : seedAccounts();
  } catch {
    accounts = seedAccounts();
  }
  let sessionId: string | null = null;
  try {
    sessionId = localStorage.getItem(SESSION_KEY);
  } catch {
    /* sem storage: sessão só em memória */
  }
  if (!accounts.some((a) => a.id === sessionId && a.active)) sessionId = null;
  return { accounts, sessionId };
}

let state: StaffState = load();
const listeners = new Set<() => void>();

function commit(next: StaffState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next.accounts));
    if (next.sessionId) localStorage.setItem(SESSION_KEY, next.sessionId);
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* modo privado / storage cheio: seguimos só em memória */
  }
  state = next;
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getState(): StaffState {
  return state;
}

export function currentAccount(s: StaffState = state): StaffAccount | null {
  return s.accounts.find((a) => a.id === s.sessionId) ?? null;
}

export function isAdmin(account: StaffAccount | null): boolean {
  return account?.role === 'admin';
}

/* ---------- sessão ---------- */

export type LoginError = 'credenciais' | 'inativo';

export function login(email: string, password: string): LoginError | null {
  const account = state.accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!account || account.password !== password) return 'credenciais';
  if (!account.active) return 'inativo';
  commit({ ...state, sessionId: account.id });
  return null;
}

/** entrada rápida usada só pelo "acesso de demonstração" do protótipo */
export function loginAs(id: string) {
  if (state.accounts.some((a) => a.id === id && a.active)) commit({ ...state, sessionId: id });
}

export function logout() {
  commit({ ...state, sessionId: null });
}

/* ---------- perfil ---------- */

type ProfilePatch = Partial<Pick<StaffAccount, 'name' | 'email' | 'phone' | 'photo' | 'title'>> & {
  /** campos só do perfil público (LP) */
  description?: string;
  site?: SitePlacement;
};

/** atualiza a conta e espelha nome/foto/cargo/descrição no perfil público (LP) */
export function updateAccount(id: string, patch: ProfilePatch) {
  const account = state.accounts.find((a) => a.id === id);
  if (!account) return;
  const { description, site, ...own } = patch;
  const next = { ...account, ...own };
  if (account.professionalId) {
    updateProfessional(account.professionalId, {
      name: next.name,
      photo: next.photo,
      role: next.title,
      ...(description !== undefined && { description }),
      ...(site !== undefined && { site }),
    });
  }
  commit({ ...state, accounts: state.accounts.map((a) => (a.id === id ? next : a)) });
}

export function emailTaken(email: string, exceptId?: string) {
  return state.accounts.some(
    (a) => a.id !== exceptId && a.email.toLowerCase() === email.trim().toLowerCase(),
  );
}

export function changePassword(id: string, current: string, next: string): boolean {
  const account = state.accounts.find((a) => a.id === id);
  if (!account || account.password !== current) return false;
  commit({ ...state, accounts: state.accounts.map((a) => (a.id === id ? { ...a, password: next } : a)) });
  return true;
}

/* ---------- gestão da equipe (admin) ---------- */

/** redefinição feita por um admin (não pede a senha atual) */
export function resetPassword(id: string, next: string) {
  commit({ ...state, accounts: state.accounts.map((a) => (a.id === id ? { ...a, password: next } : a)) });
}

export function adminCount() {
  return state.accounts.filter((a) => a.role === 'admin' && a.active).length;
}

export function addStaff(input: {
  name: string;
  title: string;
  email: string;
  password: string;
  role: StaffRole;
  photo: string;
  /** cria também o perfil público (avaliações e LP) */
  attends: boolean;
  description: string;
  site: SitePlacement;
}): StaffAccount {
  const pro = input.attends
    ? addProfessional({
        name: input.name,
        role: input.title,
        description: input.description,
        site: input.site,
        photo: input.photo || '/assets/levita-icon.png',
        active: true,
      })
    : null;
  const account: StaffAccount = {
    id: `acc-${Date.now().toString(36)}`,
    name: input.name,
    email: input.email.trim(),
    password: input.password,
    role: input.role,
    title: input.title,
    phone: '',
    photo: input.photo,
    active: true,
    professionalId: pro?.id ?? null,
  };
  commit({ ...state, accounts: [...state.accounts, account] });
  return account;
}

/** `false` quando a mudança deixaria a clínica sem nenhum admin ativo */
export function setRole(id: string, role: StaffRole): boolean {
  const account = state.accounts.find((a) => a.id === id);
  if (!account) return false;
  if (account.role === 'admin' && role !== 'admin' && account.active && adminCount() <= 1) return false;
  commit({ ...state, accounts: state.accounts.map((a) => (a.id === id ? { ...a, role } : a)) });
  return true;
}

export function toggleStaff(id: string): boolean {
  const account = state.accounts.find((a) => a.id === id);
  if (!account) return false;
  if (account.active && account.role === 'admin' && adminCount() <= 1) return false;
  if (account.professionalId) toggleProfessional(account.professionalId);
  commit({ ...state, accounts: state.accounts.map((a) => (a.id === id ? { ...a, active: !a.active } : a)) });
  return true;
}

/** remove a conta e, se existir, o perfil público com as suas avaliações */
export function removeStaff(id: string): boolean {
  const account = state.accounts.find((a) => a.id === id);
  if (!account) return false;
  if (account.role === 'admin' && account.active && adminCount() <= 1) return false;
  if (account.professionalId) removeProfessional(account.professionalId);
  commit({
    accounts: state.accounts.filter((a) => a.id !== id),
    sessionId: state.sessionId === id ? null : state.sessionId,
  });
  return true;
}

/** volta avaliações, equipe, produtos e pedidos aos dados de exemplo, mantendo a sessão */
export function resetAll() {
  const keep = currentAccount();
  resetReviews();
  resetShop();
  const accounts = seedAccounts();
  const sessionId = accounts.find((a) => a.email === keep?.email)?.id ?? accounts[0].id;
  commit({ accounts, sessionId });
}
