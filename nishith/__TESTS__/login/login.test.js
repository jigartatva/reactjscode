import React from 'react';
import {
  shallow,
  mount
} from 'enzyme';
import { Provider } from 'react-redux';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import dirtyChai from 'dirty-chai';
import Login from '../../../src/app/views/login/Login';
import { BrowserRouter as Router } from 'react-router-dom';
import { MemoryRouter } from 'react-router';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18nTest';

chai.use(dirtyChai);

jest.mock('semantic-ui-react/dist/commonjs/addons/Portal/Portal', () => ({ children }) => children);

describe('Login VIEW ', () => {
  const props = {
    currentView: 'login',
    enterLogin: () => { },
    leaveLogin: () => { },

    user: { username: '' },
    userIsAuthenticated: false,
    mutationLoading: false,
    error: null,
    loginUser: () => { },
    onUserLoggedIn: () => { },
    resetError: () => { }
  };
  it('should render "Login" view', () => {
    const wrapper = shallow(<Login {...props} />);

    expect(wrapper).to.exist();
    expect(wrapper.containsMatchingElement(<legend>Login</legend>));
  });

  it('should call enterLogin action', () => {
    /* eslint-disable no-unused-vars */
    const wrapper = mount(

      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <Login
            {...props}
            currentView={props.currentView}
            isOpen={true}
          >
          </Login>
        </I18nextProvider>
      </MemoryRouter>

    );
    wrapper.unmount();
  });

  it('After enter login check for invalid email', () => {
    const enterLoginAction = sinon.spy(); // called on componentDidMount
    /* eslint-disable no-unused-vars */
    const wrapper = mount(

      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <Login
            {...props}
            currentView={props.currentView}
            enterLogin={enterLoginAction}
            isOpen={true}
            leaveLogin={() => { }}
          >
          </Login>
        </I18nextProvider>
      </MemoryRouter>

    );
    /* eslint-enable no-unused-vars */
    expect(wrapper.find('Form')).to.have.length(1);
    const formFieldEmail = wrapper.find('#formFieldEmail');
    formFieldEmail.simulate('change', { target: { value: '' } });
    formFieldEmail.simulate('blur');
    wrapper.find('Form').simulate('submit');
    const formFieldEmailWrap = wrapper.find('FormField').get(0);
    expect(formFieldEmailWrap.props.className).to.equal('form-group error');
  });

  it('After enter login check for invalid password', () => {
    const enterLoginAction = sinon.spy(); // called on componentDidMount
    /* eslint-disable no-unused-vars */
    const wrapper = mount(

      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <Login
            {...props}
            currentView={props.currentView}
            enterLogin={enterLoginAction}
            isOpen={true}
            leaveLogin={() => { }}
          >
          </Login>
        </I18nextProvider>
      </MemoryRouter>

    );
    /* eslint-enable no-unused-vars */
    expect(wrapper.find('Form')).to.have.length(1);
    const formFieldPassword = wrapper.find('#formFieldPassword');
    formFieldPassword.simulate('change', { target: { value: '' } });
    formFieldPassword.simulate('blur');
    wrapper.find('Form').simulate('submit');
    const formFieldPasswordWrap = wrapper.find('FormField').get(1);
    expect(formFieldPasswordWrap.props.className).to.equal('form-group error');
  });

  it('After enter login - Email And Password are valid', () => {
    const enterLoginAction = sinon.spy(); // called on componentDidMount
    /* eslint-disable no-unused-vars */
    const wrapper = mount(

      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <Login
            {...props}
            currentView={props.currentView}
            enterLogin={enterLoginAction}
            isOpen={true}
            leaveLogin={() => { }}
          >
          </Login>
        </I18nextProvider>
      </MemoryRouter>

    );
    /* eslint-enable no-unused-vars */
    expect(wrapper.find('Form')).to.have.length(1);
    const formFieldEmail = wrapper.find('#formFieldEmail');
    formFieldEmail.simulate('change', { target: { value: 'bluelabel1@gwlabs.com' } });
    formFieldEmail.simulate('blur');

    const formFieldPassword = wrapper.find('#formFieldPassword');
    formFieldPassword.simulate('change', { target: { value: 'password' } });
    formFieldPassword.simulate('blur');

    wrapper.find('Form').simulate('submit');
    const formFieldEmailWrap = wrapper.find('FormField').get(0);
    expect(formFieldEmailWrap.props.className).to.equal('form-group success');
    const formFieldPasswordWrap = wrapper.find('FormField').get(1);
    expect(formFieldPasswordWrap.props.className).to.equal('form-group success');
  });

  it('should call leaveLogin action', () => {
    const wrapper = mount(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <Login
            {...props}
            currentView={props.currentView}
          />
        </I18nextProvider>
      </MemoryRouter>
    );
    wrapper.unmount();
  });
});
