
import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Boolean = 0 | 1;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

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
  store_type: "main" | "user";
  user_id: number | null;
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

export interface Users {
  id: Generated<number>;
  username: string;
  password: string;
  email: string | null;
  phone_number: string | null;
  profile_image_url: string | null;
  cover_photo_url: string | null;
}

export interface DB {
  MainHubUpgradeV001ForBroadcasts: MainHubUpgradeV001ForBroadcasts;
  MainHubUpgradeV001ForCartItems: MainHubUpgradeV001ForCartItems;
  MainHubUpgradeV001ForEpisodeImages: MainHubUpgradeV001ForEpisodeImages;
  MainHubUpgradeV001ForEpisodes: MainHubUpgradeV001ForEpisodes;
  MainHubUpgradeV001ForEpisodeTags: MainHubUpgradeV001ForEpisodeTags;
  MainHubUpgradeV001ForProducts: MainHubUpgradeV001ForProducts;
  messages: Messages;
  users: Users;
}
