import React from 'react';
import AuthForm from '../components/auth-form';
import Redirect from '../components/redirect';
import AppContext from '../lib/app-context';

export default class AuthPage extends React.Component {

  render() {

    const { user, route, handleSignIn } = this.context;
    if (user) return <Redirect to='' />;
    const action = route.params.get('action');

    return (
      <div className='sign-up-container d-flex text-center poppins-font'>
        <AuthForm
          key={action}
          action={action}
          onSignIn={handleSignIn} />
      </div>
    );
  }
}

AuthPage.contextType = AppContext;
