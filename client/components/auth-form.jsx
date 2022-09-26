import React from 'react';

export default class AuthForm extends React.Component {
  constructor(props) {
    super(props);
    if (this.props.action === 'sign-in') {
      this.state = {
        username: 'TestUser2222',
        password: 'password'
      };
    } else {
      this.state = {
        username: '',
        password: ''
      };
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { action } = this.props;
    const req = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state)
    };
    fetch(`/api/auth/${action}`, req)
      .then(res => res.json())
      .then(result => {
        if (action === 'sign-up') {
          window.location.hash = '#auth?action=sign-in';
        } else if (result.user && result.token) {
          window.location.hash = '';
          this.props.onSignIn(result);
        }
      });
  }

  render() {
    const { action } = this.props;
    if (action === 'sign-up') {
      return (
        <>
          <div className='login-button-viewswap d-flex poppins-font'>
            <a href='#auth?action=sign-up' className='sign-up-viewswap active-highlight'>Sign Up</a>
            <a href='#auth?action=sign-in' className='sign-in-viewswap inactive-highlight'>Log In</a>
          </div>
          <form className='login-form' onSubmit={this.handleSubmit} autoComplete="off">
            <div className='logo-container'>
              <img className='main-logo' src='../images/icon.png' />
              <h1 className='main-title'>Sign Up</h1>
            </div>
            <div className="d-flex">
              <label htmlFor="username" />
              <i className="fa-solid fa-user fa-2xl login-icons" />
              <input
                required
                type="text"
                className="user-input"
                id="username"
                name="username"
                onChange={this.handleChange}
                placeholder="Choose Username"
                value={this.state.username} />
            </div>
            <div className="d-flex">
              <label htmlFor="password" />
              <i className="fa-solid fa-key fa-2xl login-icons" />
              <input
                required
                type="password"
                className="user-input"
                id="password"
                name="password"
                onChange={this.handleChange}
                placeholder="Set A Password"
                value={this.state.password} />
            </div>
            <button onSubmit={this.handleSubmit} className="login-button">Create Account</button>
          </form>
        </>
      );
    } else if (action === 'sign-in') {
      return (
        <>
          <div className='login-button-viewswap d-flex poppins-font'>
            <a href='#auth?action=sign-up' className='sign-up-viewswap inactive-highlight'>Sign Up</a>
            <a href='#auth?action=sign-in' className='sign-in-viewswap active-highlight'>Log In</a>
          </div>
          <form className='login-form' onSubmit={this.handleSubmit} autoComplete="off">
            <div className='logo-container'>
              {/* <img className='main-logo' src='../images/icon.png'></img> */}
              <h1 className='main-title'>Sign In</h1>
            </div>
            <div className="d-flex">
              <label htmlFor="input-username" />
              <i className="fa-solid fa-user fa-2xl login-icons" />
              <input
                required
                type="text"
                className="user-input"
                id="username"
                name="username"
                onChange={this.handleChange}
                placeholder="Enter Username"
                value={this.state.username} />
            </div>
            <div className="d-flex">
              <label htmlFor="input-password" />
              <i className="fa-solid fa-key fa-2xl login-icons" />
              <input
                required
                type="password"
                className="user-input"
                id="password"
                name="password"
                onChange={this.handleChange}
                placeholder="Enter Password"
                value={this.state.password} />
            </div>
            <button type="submit" className="login-button">Log In</button>
          </form>
        </>
      );
    }
  }
}

yesterday i finished my nav bar, login form, and footer on the front end and implemented some bootstrap to it.. today
im going to work the authorization form today for the login page
