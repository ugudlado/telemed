import React, { FunctionComponent, ChangeEvent } from 'react';
import TextField from '@material-ui/core/TextField';

interface Prop {
    label : string,
    onChange(value:string):void,
    initialValue: string,
}

interface State {
  value:string
}

const TextBox : FunctionComponent<Prop> = (props) => {

  const [state, setState] = React.useState<State>({value:props.initialValue});
  const id = 'txt'+props.label.replace(" ","-");

  return (
      <TextField
        id={id}
        label={props.label}
        value={state.value}
        onChange={(e:ChangeEvent<HTMLInputElement>)=> { setState({value:e.target.value});props.onChange(e.target.value);}}
        margin="normal"
        fullWidth={true}
      />);
}

export default TextBox;