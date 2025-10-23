import { registerWebModule, NativeModule } from 'expo';

import { ExpoGoogleSigninModuleEvents } from './ExpoGoogleSignin.types';

class ExpoGoogleSigninModule extends NativeModule<ExpoGoogleSigninModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoGoogleSigninModule, 'ExpoGoogleSigninModule');
