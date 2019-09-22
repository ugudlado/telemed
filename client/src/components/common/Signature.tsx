import React, { FunctionComponent } from 'react'
import SignatureCanvas from 'react-signature-canvas'
 
const Signature : FunctionComponent = ()=> {
return (
    <span style={{borderColor: 'black', borderWidth:1, borderStyle:'solid', display:'block'}}>
  <SignatureCanvas penColor='black'
    canvasProps={{width: 200, height: 100, className: 'sigCanvas'}} />
    </span>)
}
export default Signature;