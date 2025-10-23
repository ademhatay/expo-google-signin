import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoGoogleSigninViewProps } from './ExpoGoogleSignin.types';

const NativeView: React.ComponentType<ExpoGoogleSigninViewProps> =
  requireNativeView('ExpoGoogleSignin');

export default function ExpoGoogleSigninView(props: ExpoGoogleSigninViewProps) {
  return <NativeView {...props} />;
}
