import { useApi } from "~/composables/useApi";
import { computed } from "vue";

export const useMenu = () => {
  const { adminMenus } = useApi();
  const adminStore = useAdminStore();

  const permissionMap = computed(() => {
    const map = {};
    if (adminStore.menuPermissions) {
      for (const { key, permissionValue } of adminStore.menuPermissions) {
        map[key] = permissionValue;
      }
    }
    return map;
  });

  const buildTree = items => {
    const map = new Map();
    items.forEach(item => {
      map.set(item.id, {
        title: item.title,
        key: item.keyCode || item.key,
        url: item.url,
        icon: item.icon,
        permissionBit: item.permissionBit ?? 0,
        stt: item.stt ?? 0,
        children: [],
      });
    });
    items.forEach(item => {
      const pId = item.parentId ?? item.parent_Id;
      const parent = map.get(pId);
      if (parent) {
        parent.children.push(map.get(item.id));
      }
    });
    const sortTree = nodes => {
      nodes.sort((a, b) => a.stt - b.stt);
      nodes.forEach(n => sortTree(n.children));
    };
    const roots = items
      .filter(i => {
        const pId = i.parentId ?? i.parent_Id;
        return pId === 0 || pId === null;
      })
      .map(i => map.get(i.id));

    sortTree(roots);
    const stripStt = nodes => {
      nodes.forEach(n => {
        delete n.stt;
        if (n.children.length) stripStt(n.children);
      });
    };
    stripStt(roots);
    return roots;
  };

  const filterMenu = (nodes, parentKey = "menu") => {
    if (!nodes || !Array.isArray(nodes)) return [];
    return nodes
      .map(node => {
        const permVal = permissionMap.value[parentKey] ?? 0;
        const permission = (permVal >> node.permissionBit) & 0b11;
        const children = node.children ? filterMenu(node.children, node.key) : [];
        if (permission > 0 || children.length > 0) {
          return { ...node, children };
        }
        return null;
      })
      .filter(Boolean);
  };

  const loadMenu = async () => {
    try {
      // key: `admin-permission-${Date.now()}`
      const { data } = await adminMenus.get({
        // key: `admin-menu-${Date.now}`,
      });
      if (data.value?.success) {
        const tree = buildTree(data.value.data.items);
        adminStore.setMenu(tree);
        return tree;
      }
    } catch (e) {
      console.error("Failed to load menu", e);
    }
  };

  const visibleMenu = computed(() => {
    if (adminStore.isSuperAdmin) {
      return adminStore.menu;
    }
    return filterMenu(adminStore.menu);
  });

  return { loadMenu, visibleMenu, buildTree };
};
