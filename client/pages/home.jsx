import React from 'react';
import Redirect from '../components/redirect';
import AppContext from '../lib/app-context';
import Header from '../components/header';
import PageContainer from '../components/page-container';
import SearchBar from '../components/search-bar';
import UserList from '../components/user-list';

export default class Home extends React.Component {

  render() {

    if (!this.context.user) return <Redirect to="#auth?action=sign-in" />;

    const { route } = this.context;
    return (
      <>
        <Header />
        <PageContainer>
          <SearchBar />
          <UserList routeParams={route.params} />
        </PageContainer>
      </>
    );
  }
}
Home.contextType = AppContext;
