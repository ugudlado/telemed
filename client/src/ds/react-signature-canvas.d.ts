//Hack changes for typescript
declare module 'react-signature-canvas' {
    var SignaturePad: any;
    export = SignaturePad;
  }