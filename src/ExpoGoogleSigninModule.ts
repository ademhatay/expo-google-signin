import { NativeModule, requireNativeModule } from 'expo';

import { ExpoGoogleSigninModuleEvents } from './ExpoGoogleSignin.types';

declare class ExpoGoogleSigninModule extends NativeModule<ExpoGoogleSigninModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoGoogleSigninModule>('ExpoGoogleSignin');
