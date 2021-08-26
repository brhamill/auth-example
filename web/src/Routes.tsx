import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Header } from './Header';
import { Bye } from './pages/Bye';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

export const Routes: React.FC = () => {
  return (
    <BrowserRouter>
      <div>
        <Header />
        <Switch>
          <Route exact path='/' component={Home} />
          <Route path='/register' component={Register} />
          <Route path='/login' component={Login} />
          <Route path='/bye' component={Bye} />
        </Switch>
      </div>
    </BrowserRouter>
  );
};
