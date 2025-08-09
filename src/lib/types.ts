import { JWK } from 'jose';

export interface JsonObject {
  [key: string]: JsonValue;
}
export interface JsonArray extends Array<JsonValue> {}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;

export type Ed25519KeyType = { publicJwk: JWK; privateJwk: JWK };
