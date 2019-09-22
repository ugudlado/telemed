import React, {ChangeEvent,  FunctionComponent} from "react";

import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import InputAdornment from '@material-ui/core/InputAdornment';

import TextField from '@material-ui/core/TextField';
import {Paper, Grid} from '@material-ui/core';
import { AccountCircle, VpnKey } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    container: {
        height: 500,
    },
    paper: {
      padding: theme.spacing(2),
      width: 300
    },
    image: {
      width: 128,
      height: 128,
    },
    img: {
      margin: 'auto',
      display: 'block',
      maxWidth: '100%',
      maxHeight: '100%',
    },
    textfield : {
        marginBottom:20
    }
  }));

interface onLogin {
    (userName:string, password:string):void
}

interface Props {
    onLogin:onLogin
}

interface State {
    userName:string,
    password:string
}

const Login :FunctionComponent<Props> = (props) => {
    const classes = useStyles();

    const [initialState, setState] = React.useState<State>({userName:"",password:""});
    function setUserName(event:ChangeEvent<HTMLInputElement>) {
        setState({userName:event.target.value, password:initialState.password});
    }
    function setPassword(event:ChangeEvent<HTMLInputElement>) {
        setState({userName:initialState.userName, password:event.target.value});
    }
    return (
        <Grid container spacing={2} alignItems="center" className={classes.container}>
        <Paper className={classes.paper}>
        
        <Grid item>
            <TextField
                className={classes.textfield}
                fullWidth={true}
                id="input-username"
                label="Username"
                onChange={setUserName}
                InputProps={{
                    startAdornment: (                        
                    <InputAdornment position="start">
                            <AccountCircle />
                        </InputAdornment>
                    )}
                }
            />
        </Grid>

        <Grid item>
            <TextField
                className={classes.textfield}
                fullWidth={true}
                id="input-password"
                type="password"
                label="Password"
                onChange={setPassword}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <VpnKey />
                        </InputAdornment>
                    ),
                }}
            />
        </Grid>
        <Grid>
            <Button onClick={()=>props.onLogin(initialState.userName, initialState.password)}>Login</Button>
        </Grid>
    </Paper>
    </Grid>);
};

export default Login;