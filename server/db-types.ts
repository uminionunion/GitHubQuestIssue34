
import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Boolean = 0 | 1;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface BlockedUsers {
  id: Generated<number>;
  blocker_id: number;
  blocked_id: number;
}

export interface Friends {
  id: Generated<number>;
  user_id1: number;
  user_id2: number;
  status: "pending" | "accepted" | "rejected";
}

export interface MainHubUpgradeV001ForBroadcasts {
  id: Generated<number>;
  user_id: number;
  name: string;
}

export interface MainHubUpgradeV001ForCartItems {
  id: Generated<number>;
  user_id: number;
  product_id: number;
  quantity: Generated<number>;
}

export interface MainHubUpgradeV001ForEpisodeImages {
  id: Generated<number>;
  episode_id: number;
  image_url: string;
}

export interface MainHubUpgradeV001ForEpisodes {
  id: Generated<number>;
  broadcast_id: number;
  name: string;
  subtitle: string | null;
  description: string | null;
  media_url: string;
  cover_image_url: string | null;
  scheduled_at: string | null;
}

export interface MainHubUpgradeV001ForEpisodeTags {
  id: Generated<number>;
  episode_id: number;
  tag: string;
}

export interface MainHubUpgradeV001ForProducts {
  id: Generated<number>;
  name: string;
  subtitle: string | null;
  description: string | null;
  price: number | null;
  image_url: string | null;
  store_type: 'main' | 'user' | 'store';
  user_id: number | null;
  store_id: number | null;
  payment_method: string | null;
  payment_url: string | null;
  is_in_trash: Boolean;
  sku_id: string | null;
  created_at: Generated<string | null>;
  user_store_id: number | null;
}

export interface MainHubUpgradeV001ForProductTrash {
  id: Generated<number>;
  product_id: number;
  user_id: number;
  deleted_at: Generated<string | null>;
}

export interface MainHubUpgradeV001ForInternalCart {
  id: Generated<number>;
  user_id: number;
  product_id: number;
  quantity: Generated<number>;
  added_at: Generated<string | null>;
}

export interface MainHubUpgradeV001ForLookingFor {
  id: Generated<number>;
  user_id: number;
  store_id: number;
  item_name: string;
  description: string | null;
  created_at: Generated<string | null>;
}

export interface MainHubUpgradeV001ForStores {
  id: Generated<number>;
  store_number: number;
  store_name: string;
  store_type: string;
  chatroom_id: number | null;
  description: string | null;
  created_at: Generated<string | null>;
}

export interface UserStores {
  id: Generated<number>;
  user_id: number;
  name: string;
  subtitle: string | null;
  description: string | null;
  created_at: Generated<string | null>;
}

export interface Messages {
  id: Generated<number>;
  content: string;
  room: string;
  user_id: number | null;
  is_anonymous: Boolean;
  timestamp: Generated<string | null>;
  anonymous_username: string | null;
}

export interface Reports {
  id: Generated<number>;
  reporter_id: number;
  reported_id: number | null;
  reason: string;
  images: string | null;
  created_at: Generated<string | null>;
}

export interface UserChatrooms {
  id: Generated<number>;
  creator_id: number;
  title: string;
  password: string | null;
  allow_anonymous: Generated<Boolean>;
  background_color: string | null;
  font_color: string | null;
  created_at: Generated<string | null>;
  last_active_at: Generated<string | null>;
}

export interface Users {
  id: Generated<number>;
  username: string;
  password: string;
  email: string | null;
  phone_number: string | null;
  profile_image_url: string | null;
  cover_photo_url: string | null;
  is_high_high_high_admin: Boolean;
  is_high_high_admin: Boolean;
  is_high_admin: Boolean;
  is_special_user: Boolean;
  is_special_special_user: Boolean;
  is_special_special_special_user: Boolean;
  is_blocked: Boolean;
  is_banned_from_chatrooms: Boolean;
}

export interface DB {
  blocked_users: BlockedUsers;
  friends: Friends;
  MainHubUpgradeV001ForBroadcasts: MainHubUpgradeV001ForBroadcasts;
  MainHubUpgradeV001ForCartItems: MainHubUpgradeV001ForCartItems;
  MainHubUpgradeV001ForEpisodeImages: MainHubUpgradeV001ForEpisodeImages;
  MainHubUpgradeV001ForEpisodes: MainHubUpgradeV001ForEpisodes;
  MainHubUpgradeV001ForEpisodeTags: MainHubUpgradeV001ForEpisodeTags;
  MainHubUpgradeV001ForProducts: MainHubUpgradeV001ForProducts;
  MainHubUpgradeV001ForProductTrash: MainHubUpgradeV001ForProductTrash;
  MainHubUpgradeV001ForInternalCart: MainHubUpgradeV001ForInternalCart;
  MainHubUpgradeV001ForLookingFor: MainHubUpgradeV001ForLookingFor;
  MainHubUpgradeV001ForStores: MainHubUpgradeV001ForStores;
  messages: Messages;
  reports: Reports;
  user_chatrooms: UserChatrooms;
  users: Users;
  user_stores: UserStores;
}
