import React from 'react';
import { Route, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom';
import './App.css';
import ChatScreen from './components/ChatComp/ChatScreenComp/ChatScreen';
import HomeComp from './components/HomeComp/HomeComp';
import LoginComp from './components/LoginComp/LoginComp';
import RegisterComp from './components/RegisterComp/RegisterComp';
import { PATHS } from './config';
import { isAuthenticated } from './utils';

function App() {
    return (
        <React.Fragment>
            <Router>
                <Switch>
                    <Route
                        exact
                        path={PATHS.CHAT}
                        render={(props) => {
                            if (isAuthenticated()) return <ChatScreen {...props} />
                            else return <Redirect to={PATHS.LOGIN} />
                        }}
                    // render={props => <ChatScreen {...props} />}
                    ></Route>
                    <Route exact path={PATHS.REGISTER} render={props => <RegisterComp {...props} />}></Route>
                    <Route
                        exact
                        path={PATHS.LOGIN}
                        // render={(props) => {
                        //     if (isAuthenticated()) return <Redirect to={PATHS.CHAT} />
                        //     else return <LoginComp {...props} />
                        // }}
                        render={props => <LoginComp {...props} />}
                    ></Route>
                    <Route exact path={PATHS.HOME} render={props => <HomeComp {...props} />}></Route>
                </Switch>
            </Router>
        </React.Fragment>
    );
}

export default App;
