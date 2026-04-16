import { MENU_ITEMS } from '../config/menuConfig';
import { localAccessSeed } from '../data/seedData';
import { supabase } from '../lib/supabase';
import type { AppUser, MenuItemConfig, UserAccess } from '../types';

function normalize(value: string | undefined) {
  return (value || '').trim().toLowerCase();
}

export function isRoleAllowed(user: AppUser | null, item: MenuItemConfig) {
  if (!user) return false;
  if (user.role?.is_admin) return true;
  const roleName = normalize(user.role?.name);
  return item.roles.some((role) => normalize(role) === roleName);
}

export async function getUserAccessMap(user: AppUser | null): Promise<Record<string, boolean>> {
  const defaults = Object.fromEntries(
    MENU_ITEMS.map((item) => [item.screenName, isRoleAllowed(user, item)])
  ) as Record<string, boolean>;

  if (!user) return defaults;
  if (user.role?.is_admin) {
    return Object.fromEntries(MENU_ITEMS.map((item) => [item.screenName, true]));
  }

  let records: UserAccess[] = localAccessSeed.filter((item) => item.user_id === user.id);

  if (supabase) {
    const { data } = await supabase
      .from('user_access')
      .select('*')
      .eq('user_id', user.id)
      .eq('can_read', true);

    if (Array.isArray(data) && data.length > 0) {
      records = data as UserAccess[];
    }
  }

  for (const item of records) {
    defaults[item.screen_name] = item.can_read;
  }

  return defaults;
}

export function getVisibleMenuItems(user: AppUser | null, accessMap: Record<string, boolean>) {
  return MENU_ITEMS.filter((item) => isRoleAllowed(user, item) || accessMap[item.screenName]);
}
