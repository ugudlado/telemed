import React, { FunctionComponent } from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import {Grid} from '@material-ui/core';
import TextBox from './TextBox';
import RadioGroup, { Option } from './RadioGroup'

const theme = createMuiTheme({
  palette: {
    primary: { main: '#8BC3D1' },
  },
});

interface Props {
    fields:Array<Field>
}

export enum FieldType {
    Text,RadioGroup,Select
}

interface FormField {
    key:string,
    value:string,
    label:string,
    type:FieldType
    when?:Condition
}

interface Condition {
    key:string,
    matches:string
}

interface TextField extends FormField {
    type: FieldType.Text
}

interface RadioGroupField extends FormField {
    options: Array<Option>
}

interface State {
    values:Array<KeyValuePair>
}
export interface KeyValuePair {
    key:string,
    value:String
}


export type Field = TextField | RadioGroupField;


const FormBuilder : FunctionComponent<Props> = (props)=> {
    const originalState = {
        values:[]
    };
    const [state, setState] = React.useState<State>(originalState);

    function onChange(key:string, value:string){
        const field = state.values.find(item=> item.key === key);
        if(field){
            field.value = value;
        } else {
            state.values.push({key:key,value:value});
        }
        setState(Object.assign({}, state));
    }

    function buildFields(field:Field) {
        //For conditional fields, check if the condition satifies else return
        const condition = field.when; 
        if(condition)
            if(!state.values.find(value => value.key === condition.key && value.value === condition.matches)){
                return;
            }
                
        switch(field.type){
            case FieldType.Text:
                const textField = field as TextField;
                return  <TextBox initialValue={textField.value} label={textField.label} onChange={(v)=>console.log(v)}/>
            case FieldType.RadioGroup:
                const radioGroup = field as RadioGroupField;
                return <RadioGroup id={radioGroup.key} label={radioGroup.label} options={radioGroup.options} onChange={onChange}/>
            default:
                console.error("Field type not implemented")
        }
    }

    return (
        <Grid container justify="flex-start" direction="column">
            <MuiThemeProvider theme={theme}>
            {props.fields.map(field=><Grid key={field.key} item>{buildFields(field)}</Grid>)}
            </MuiThemeProvider>
    </Grid>
)}

export default FormBuilder;
