import { StructuredType } from '../models/builder.model';

/**
 * Key conventions of the Rune JSON serialisation that CDM 7 emits.
 *
 * Metadata used to be carried in a wrapper object alongside a `meta` sibling:
 *
 *   "name": { "value": "Acme Corp" }
 *   "personId": [ { "value": { "identifier": { "value": "jdoe" } } } ]
 *
 * It is now carried on `@`-prefixed keys sitting next to the data itself, and
 * structured attributes are no longer wrapped at all:
 *
 *   "name": { "@data": "Acme Corp", "@scheme": "http://..." }
 *   "personId": [ { "identifier": { "@data": "jdoe" } } ]
 *
 * References and keys follow the same shape — `@key`, `@key:external`,
 * `@key:scoped`, `@ref`, `@ref:external`, `@ref:scoped` — which is why anything
 * `@`-prefixed is treated uniformly as metadata rather than as a model attribute.
 */
export const RUNE_DATA_KEY = '@data';
export const RUNE_MODEL_KEY = '@model';
export const RUNE_TYPE_KEY = '@type';
export const RUNE_VERSION_KEY = '@version';

/** Wrapper key of the pre-CDM-7 serialisation. Still accepted on import. */
export const LEGACY_VALUE_KEY = 'value';

export function isRuneMetaKey(key: string): boolean {
  return key.startsWith('@');
}

/**
 * The Rune model a type belongs to, i.e. the first segment of its namespace
 * (`cdm.base.staticdata.party` -> `cdm`). This is the `@model` of the envelope,
 * which is not the same as the Maven artifact name reported in the UI header
 * (`cdm-java`).
 */
export function runeModelName(type: StructuredType): string {
  return type.namespace.split('.')[0];
}

export function runeQualifiedTypeName(type: StructuredType): string {
  return `${type.namespace}.${type.name}`;
}

/**
 * Reads the value out of a metadata-annotated basic attribute, accepting the
 * CDM 7 `@data` wrapper, the pre-CDM-7 `value` wrapper, and a bare scalar (which
 * is how Rune writes a metadata attribute that carries no metadata at all).
 */
export function unwrapRuneValue(value: any): any {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }
  if (RUNE_DATA_KEY in value) {
    return value[RUNE_DATA_KEY];
  }
  if (LEGACY_VALUE_KEY in value) {
    return value[LEGACY_VALUE_KEY];
  }
  return value;
}
