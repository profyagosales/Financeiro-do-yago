export interface ListItem {
  id: number;
  title: string;
  completed: boolean;
}

export const wishlist: ListItem[] = [
  { id: 1, title: 'Smartwatch', completed: false },
  { id: 2, title: 'Notebook', completed: false },
  { id: 3, title: 'Fone de ouvido', completed: true },
];

export const shoppingList: ListItem[] = [
  { id: 1, title: 'Leite', completed: true },
  { id: 2, title: 'Arroz', completed: false },
  { id: 3, title: 'Pão', completed: false },
  { id: 4, title: 'Café', completed: true },
];

export function getListsSummary() {
  const wishlistCount = wishlist.length;
  const shoppingCount = shoppingList.length;
  const completed = shoppingList.filter((item) => item.completed).length;
  const completedPercent = shoppingCount
    ? Math.round((completed / shoppingCount) * 100)
    : 0;

  return { wishlistCount, shoppingCount, completedPercent };
}
