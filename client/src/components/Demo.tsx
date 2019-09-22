import React, {FunctionComponent} from 'react';
import { Grid, List, ListItem, ListItemText } from '@material-ui/core';
import { ListItemProps } from '@material-ui/core/ListItem';
import { Router, RouteComponentProps } from "@reach/router";
import Login from './Login';
import SearchPatient from './SearchPatient';
import Video from './VideoComponent';
import SearchDoctor from './Searchdoctor';
import Signature from './common/Signature';

type Props = { component: FunctionComponent } & RouteComponentProps;

const Route: FunctionComponent<Props> = ({ component: Component, ...rest }) => (
  <Component {...rest} />
);


export default function Demo() {

    const LoginDemo :FunctionComponent = () => (<Login onLogin={(u,p)=>console.log(u+p)}/>)

    function ListItemLink(props: ListItemProps<'a', { button?: true }>) {
        return <ListItem button component="a" {...props} />;
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={2}>
                <List component="nav" aria-label="secondary mailbox folders">

                    <ListItemLink href="login">
                        <ListItemText primary="Login" />
                    </ListItemLink>
                    <ListItemLink href="search">
                        <ListItemText primary="Search Patients" />
                    </ListItemLink>
                    <ListItemLink href="videoConference">
                        <ListItemText primary="Video Conference" />
                    </ListItemLink>
                    <ListItemLink href="chooseDoctor">
                        <ListItemText primary="Choose Doctor" />
                    </ListItemLink>
                    <ListItemLink href="signature">
                        <ListItemText primary="Signature" />
                    </ListItemLink>
                </List>
            </Grid>
            <Grid item xs={10} container justify="center">
                <Router>
                    <Route component={LoginDemo} path="login" />
                    <Route component={SearchPatient} path="search" />
                    <Route component={Video} path="videoConference" />
                    <Route component={SearchDoctor} path="chooseDoctor" />
                    <Route component={Signature} path="signature" />
                </Router>
            </Grid>
        </Grid>
    );
}