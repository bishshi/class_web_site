// types/wistia.d.ts
import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'wistia-player': {
        'media-id'?: string;
        style?: React.CSSProperties;
        class?: string;
        className?: string;
      };
    }
  }
}