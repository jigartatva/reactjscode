// ---- IMPORTS ----
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { graphql } from 'react-apollo';
import * as userAuthActions from '../../redux/modules/userAuth';
import Login from './Login';
import logUserMutation from '../../gql/mutations/login.gql';

// ---- REDUX ----
const mapStateToProps = state => {
  return { mutationLoading: state.userAuth.mutationLoading, };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ ...userAuthActions, }, dispatch, );
};

// Mutation options for login graphql call
const logUserMutationOptions = {
  props: ({ ownProps, mutate }) => ({
    async loginUser(user) {
      ownProps.setLoadingStateForUserLogin();
      try {
        const payload = { variables: user };
        const { data: { signIn } } = await mutate(payload);
        ownProps.receivedUserLoggedIn(signIn.access_token, signIn);
        ownProps.unsetLoadingStateForUserLogin();
        return Promise.resolve(signIn);
      } catch (error) {
        ownProps.errorUserLoggedIn(error);
        ownProps.unsetLoadingStateForUserLogin();
        return Promise.reject(error);
      }
    },
  }),
};

const UserAuth = graphql(logUserMutation, logUserMutationOptions)(Login)
export default connect(mapStateToProps, mapDispatchToProps)(UserAuth);
