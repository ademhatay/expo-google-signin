import * as React from 'react';

import { ExpoGoogleSigninViewProps } from './ExpoGoogleSignin.types';

export default function ExpoGoogleSigninView(props: ExpoGoogleSigninViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
