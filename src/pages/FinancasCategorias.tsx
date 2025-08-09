import { useState } from 'react';
import { useCategories, Category } from '@/hooks/useCategories';
import BrandIcon from '@/components/BrandIcon';
import { Icon } from '@iconify/react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FinancasCategorias() {
  const { categories, create, update, remove } = useCategories();
  const [novo, setNovo] = useState({
    name: '',
    color: '#000000',
    icon_key: '',
    kind: 'expense' as Category['kind'],
  });

  const tree = buildTree(categories);

  async function addRoot() {
    if (!novo.name) return;
    await create({
      name: novo.name,
      color: novo.color,
      icon_key: novo.icon_key || null,
      kind: novo.kind,
      parent_id: null,
    });
    setNovo({ ...novo, name: '', icon_key: '', color: '#000000' });
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Categorias" />
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Nova categoria"
          value={novo.name}
          onChange={(e) => setNovo({ ...novo, name: e.target.value })}
          className="w-40"
        />
        <input
          type="color"
          value={novo.color}
          onChange={(e) => setNovo({ ...novo, color: e.target.value })}
          className="h-9 w-10 rounded-md border"
        />
        <Input
          placeholder="ícone (ex: lucide:home ou brand:nubank)"
          value={novo.icon_key}
          onChange={(e) => setNovo({ ...novo, icon_key: e.target.value })}
          className="w-56"
        />
        <select
          value={novo.kind}
          onChange={(e) => setNovo({ ...novo, kind: e.target.value as Category['kind'] })}
          className="h-9 rounded-md border px-2 text-sm"
        >
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
          <option value="transfer">Transferência</option>
        </select>
        <Button onClick={addRoot}>Adicionar</Button>
      </div>
      <ul>
        {tree.map((node) => (
          <CategoryItem key={node.id} node={node} update={update} remove={remove} create={create} />
        ))}
      </ul>
    </div>
  );
}

type CategoryNode = Category & { children: CategoryNode[] };

function buildTree(flat: Category[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];
  flat.forEach((c) => map.set(c.id, { ...c, children: [] }));
  map.forEach((node) => {
    if (node.parent_id) {
      const parent = map.get(node.parent_id);
      if (parent) parent.children.push(node);
      else roots.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function CategoryItem({
  node,
  update,
  remove,
  create,
}: {
  node: CategoryNode;
  update: (id: string, changes: Partial<Category>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  create: (payload: Partial<Category>) => Promise<void>;
}) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    name: node.name,
    color: node.color || '#000000',
    icon_key: node.icon_key || '',
    kind: node.kind as Category['kind'],
  });
  const [adding, setAdding] = useState(false);
  const [child, setChild] = useState({ name: '', color: '#000000', icon_key: '' });

  function renderIcon(icon_key: string | null, name: string) {
    if (!icon_key) return <BrandIcon name={name} />;
    if (icon_key.startsWith('brand:')) return <BrandIcon name={icon_key.slice(6)} />;
    return <Icon icon={icon_key} width={18} height={18} />;
  }

  async function save() {
    await update(node.id, {
      name: form.name,
      color: form.color,
      icon_key: form.icon_key,
      kind: form.kind,
    });
    setEdit(false);
  }

  async function addChild() {
    if (!child.name) return;
    await create({
      name: child.name,
      color: child.color,
      icon_key: child.icon_key || null,
      kind: form.kind,
      parent_id: node.id,
    });
    setChild({ name: '', color: '#000000', icon_key: '' });
    setAdding(false);
  }

  async function handleDelete() {
    if (node.children.length > 0) {
      const ok = confirm('Categoria possui subcategorias. Deseja excluir mesmo assim?');
      if (!ok) return;
    }
    await remove(node.id);
  }

  return (
    <li className="mt-2">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1" style={{ color: node.color || undefined }}>
          {renderIcon(node.icon_key, node.name)} {node.name}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setEdit((e) => !e)}>
          Editar
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setAdding((a) => !a)}>
          + Sub
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDelete}>
          Excluir
        </Button>
      </div>
      {edit && (
        <div className="ml-6 mt-2 flex flex-wrap items-center gap-2">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-40"
          />
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="h-9 w-10 rounded-md border"
          />
          <Input
            placeholder="ícone"
            value={form.icon_key}
            onChange={(e) => setForm({ ...form, icon_key: e.target.value })}
            className="w-56"
          />
          <select
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value as Category['kind'] })}
            className="h-9 rounded-md border px-2 text-sm"
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
            <option value="transfer">Transferência</option>
          </select>
          <Button size="sm" onClick={save}>
            Salvar
          </Button>
        </div>
      )}
      {adding && (
        <div className="ml-6 mt-2 flex flex-wrap items-center gap-2">
          <Input
            placeholder="Nome"
            value={child.name}
            onChange={(e) => setChild({ ...child, name: e.target.value })}
            className="w-40"
          />
          <input
            type="color"
            value={child.color}
            onChange={(e) => setChild({ ...child, color: e.target.value })}
            className="h-9 w-10 rounded-md border"
          />
          <Input
            placeholder="ícone"
            value={child.icon_key}
            onChange={(e) => setChild({ ...child, icon_key: e.target.value })}
            className="w-56"
          />
          <Button size="sm" onClick={addChild}>
            Adicionar
          </Button>
        </div>
      )}
      {node.children.length > 0 && (
        <ul className="ml-6">
          {node.children.map((c) => (
            <CategoryItem key={c.id} node={c} update={update} remove={remove} create={create} />
          ))}
        </ul>
      )}
    </li>
  );
}

