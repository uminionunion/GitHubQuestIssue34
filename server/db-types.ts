
import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Boolean = 0 | 1;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Messages {
  id: Generated<number>;
  content: string;
  room: string;
  user_id: number;
  is_anonymous: Boolean;
  timestamp: Generated<string | null>;
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
  messages: Messages;
  users: Users;
}
