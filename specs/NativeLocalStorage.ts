import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  setItem(value: string, key: string): void;
  getItem(key: string): string | null;
  setStringArray(value: string[], key: string): void;
  getStringArray(key: string): string[] | null;
  appendToStringArray(value: string, key: string): void;
  setStringArrayBulk(value: string[], key: string): void;
  removeItem(key: string): void;
  clear(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'NativeLocalStorage',
);