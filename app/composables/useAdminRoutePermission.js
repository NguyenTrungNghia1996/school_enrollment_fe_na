export const PERMISSION_STATE = {
  NO_ACCESS: 0,
  VIEW: 1,
  APPROVE: 2,
  EDIT: 3,
};

export const findAdminMenuPath = (items, path) => {
  if (!items || !items.length) return [];

  for (const item of items) {
    if (item.url === path) {
      return [item];
    }

    if (item.url && item.url.includes(":")) {
      const regexPath = item.url.replace(/:[^/]+/g, "[^/]+");
      const regex = new RegExp(`^${regexPath}$`);
      if (regex.test(path)) {
        return [item];
      }
    }

    if (item.children && item.children.length > 0) {
      const found = findAdminMenuPath(item.children, path);
      if (found.length > 0) {
        return [item, ...found];
      }
    }
  }

  for (const item of items) {
    if (item.url && item.url !== "/" && path.startsWith(`${item.url}/`)) {
      return [item];
    }
  }

  return [];
};

export const resolveAdminRoutePermission = ({ menu = [], permissions = [], path = "", isSuperAdmin = false }) => {
  if (isSuperAdmin) {
    return {
      matchedItems: [],
      permission: PERMISSION_STATE.EDIT,
    };
  }

  const matchedItems = findAdminMenuPath(menu, path);

  if (!matchedItems.length) {
    return {
      matchedItems,
      permission: PERMISSION_STATE.EDIT,
    };
  }

  const permissionMap = {};
  for (const item of permissions || []) {
    permissionMap[item.key] = item.permissionValue;
  }

  const currentItem = matchedItems[matchedItems.length - 1];
  const parentKey = matchedItems.length > 1 ? matchedItems[matchedItems.length - 2].key : "menu";
  const parentPermission = permissionMap[parentKey] ?? 0;
  const permission = (parentPermission >> currentItem.permissionBit) & 0b11;

  return {
    matchedItems,
    permission,
  };
};
