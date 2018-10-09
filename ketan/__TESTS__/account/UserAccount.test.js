import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import {
  shallow,
  mount
} from 'enzyme';
import { Provider } from 'react-redux';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import dirtyChai from 'dirty-chai';
import { BrowserRouter as Router } from 'react-router-dom';
import { MemoryRouter } from 'react-router';
import { I18nextProvider } from 'react-i18next';
import fetch from 'unfetch';
import 'jest-localstorage-mock';
import i18n from '../../../i18nTest';
import { Dimmer, Loader } from 'semantic-ui-react';

import UserAccount from '../../../../src/app/views/user/account/UserAccount';
import { auth } from '../../../../src/app/services/auth';
import configureStore from '../../../../src/app/redux/store/configureStore';


chai.use(dirtyChai);

jest.mock('semantic-ui-react/dist/commonjs/addons/Portal/Portal', () => ({ children }) => children);

const employeeWithDependentEmailsSet = { "id": "39e635e9-93c8-4e7b-a9f6-1458a8133792", "access_token": null, "user_id": "39e635e9-93c8-4e7b-a9f6-1458a8133792", "username": "bluelabel3@gwlabs.com", "access_key": null, "account_id": "98a031fd-049e-4388-831a-982cf1838d1f", "status": "ACTIVATED", "employee": { "user_id": "39e635e9-93c8-4e7b-a9f6-1458a8133792", "termination_date": "", "home_address_1": "111 Coolidge St", "city": "South Plainfield", "zip": "07080", "home_address_2": "ABC XYZ", "claimed": true, "active": true, "pbm_provider": "Est. Aetna", "pbm_price_display": "Y", "benefit_plan_name": "Core Plan", "relationship": null, "deductible_remaining": "0", "person_code": "01", "contact_phone": null, "mailing_address": null, "payment_option": "Pay at Pharmacy", "locations": [{ "name": "Location 2", "street_address": "Mexico Street", "city": "", "__typename": "Location" }], "dependents": [{ "person_code": "02", "dependent_ssn": "T100-00-1028", "first_name": "SPOUSE", "last_name": "TESTING", "relationship": "Spouse", "active": true, "email": "danny@bluelabellabs.com", "date_of_birth": "1980-01-01 00:00:00", "__typename": "Dependent" }, { "person_code": "03", "dependent_ssn": "T100-00-1027", "first_name": "CHILD", "last_name": "TESTING", "relationship": "Child", "active": false, "email": "jaydeep.jodhpura@tatvasoft.com", "date_of_birth": "2005-01-01 00:00:00", "__typename": "Dependent" }], "__typename": "Employee" }, "dependent": null, "__typename": "User" };


const employeeWithDependentEmailsNotSet = { "id": "39e635e9-93c8-4e7b-a9f6-1458a8133792", "access_token": null, "user_id": "39e635e9-93c8-4e7b-a9f6-1458a8133792", "username": "bluelabel3@gwlabs.com", "access_key": null, "account_id": "98a031fd-049e-4388-831a-982cf1838d1f", "status": "ACTIVATED", "employee": { "user_id": "39e635e9-93c8-4e7b-a9f6-1458a8133792", "termination_date": "", "home_address_1": "111 Coolidge St", "city": "", "zip": "", "home_address_2": "", "claimed": true, "active": true, "pbm_provider": "Est. Aetna", "pbm_price_display": "Y", "benefit_plan_name": "Core Plan", "relationship": null, "deductible_remaining": "0", "person_code": "01", "contact_phone": null, "mailing_address": null, "payment_option": "Pay at Pharmacy", "locations": [{ "name": "Location 2", "street_address": "Mexico Street", "city": "", "__typename": "Location" }], "dependents": [{ "person_code": "02", "dependent_ssn": "T100-00-1028", "first_name": "SPOUSE", "last_name": "TESTING", "relationship": "Spouse", "active": true, "email": "", "date_of_birth": "1980-01-01 00:00:00", "__typename": "Dependent" }, { "person_code": "03", "dependent_ssn": "T100-00-1027", "first_name": "CHILD", "last_name": "TESTING", "relationship": "Child", "active": false, "email": null, "date_of_birth": "2005-01-01 00:00:00", "__typename": "Dependent" }], "__typename": "Employee" }, "dependent": null, "__typename": "User" };

beforeAll(() => {
  const div = document.createElement('div');
  window.domNode = div;
  document.body.appendChild(div);
})
describe('USER ACCOUNT VIEW ', () => {
  const store = configureStore();

  const props = {
    currentView: 'userAccount',
    enterUserAccount: () => { },
    leaveUserAccount: () => { },

    user: { username: '' },
    userIsAuthenticated: true,
    mutationLoading: false,
    error: null,
  };

  it('RENDER VIEW', () => {
    const wrapper = shallow(<UserAccount {...props} />);

    expect(wrapper).to.exist();
    expect(wrapper.containsMatchingElement(<div>UserAccount</div>));
  });

  it('CALL enterUserAccount ACTION', () => {
    const enterUserAccountAction = sinon.spy(); // called on componentDidMount
    // eslint-disable no-unused-vars
    const wrapper = mount(

      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <div>
            <Dimmer active={false} id="pageLoader">
              <Loader size='big'>Loading</Loader>
            </Dimmer>
            <UserAccount
              {...props}
              currentView={props.currentView}
              enterUserAccount={enterUserAccountAction}
              leaveUserAccount={() => { }}
            >
            </UserAccount>
          </div>
        </I18nextProvider>
      </MemoryRouter>

      , { attachTo: window.domNode });
    wrapper.unmount();
    expect(enterUserAccountAction).to.have.property('callCount', 1);
  });

  it('employeeWithDependentEmailsSet: AFTER CLICK DEACTIVATE ACCOUNT LINK, CLICK ON CANCEL BUTTON IN THE CONFIRM POPUP', () => {
    const enterUserAccountAction = sinon.spy(); // called on componentDidMount
    //  eslint-disable no-unused-vars
    const wrapper = mount(

      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <div>
            <Dimmer active={false} id="pageLoader">
              <Loader size='big'>Loading</Loader>
            </Dimmer>
            <UserAccount
              {...props}
              currentView={props.currentView}
              enterUserAccount={enterUserAccountAction}
              leaveUserAccount={() => { }}
            >
            </UserAccount>
          </div>
        </I18nextProvider>
      </MemoryRouter>
      , { attachTo: window.domNode });

    let accountDetails = employeeWithDependentEmailsSet.employee;

    if (employeeWithDependentEmailsSet.employee == null) {
      accountDetails = employeeWithDependentEmailsSet.dependent;
    }


    wrapper.find('UserAccount').instance().setState({ accountDetails: accountDetails });
    wrapper.update();

    // eslint-enable no-unused-vars 
    expect(wrapper.find('a')).to.have.length(2);

    //On deactivate account link click
    shallow(wrapper.find('a').get(0)).simulate('click');
    wrapper.update();

    wrapper.find('#cancelButton').simulate('click');
  });

  it('employeeWithDependentEmailsSet: AFTER CLICK DEACTIVATE ACCOUNT LINK, ON CLOSE MODAL BY CLICKING CLOSE ICON', () => {
    const enterUserAccountAction = sinon.spy(); // called on componentDidMount
    //  eslint-disable no-unused-vars
    const wrapper = mount(

      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <div>
            <Dimmer active={false} id="pageLoader">
              <Loader size='big'>Loading</Loader>
            </Dimmer>
            <UserAccount
              {...props}
              currentView={props.currentView}
              enterUserAccount={enterUserAccountAction}
              leaveUserAccount={() => { }}
            >
            </UserAccount>
          </div>
        </I18nextProvider>
      </MemoryRouter>
      , { attachTo: window.domNode });

    let accountDetails = employeeWithDependentEmailsSet.employee;

    if (employeeWithDependentEmailsSet.employee == null) {
      accountDetails = employeeWithDependentEmailsSet.dependent;
    }


    wrapper.find('UserAccount').instance().setState({ accountDetails: accountDetails });
    wrapper.update();

    // eslint-enable no-unused-vars 
    expect(wrapper.find('a')).to.have.length(2);

    //On deactivate account link click
    shallow(wrapper.find('a').get(0)).simulate('click');
    wrapper.update();

    // eslint-enable no-unused-vars 
    expect(wrapper.find('i.close')).to.have.length(1);

    //On deactivate account link click
    wrapper.find('i.close').simulate('click');
    wrapper.update();
  });

  it('employeeWithDependentEmailsSet: AFTER CLICK DEACTIVATE ACCOUNT LINK, CLICK ON ACCEPT BUTTON IN THE CONFIRM POPUP', () => {
    const enterUserAccountAction = sinon.spy(); // called on componentDidMount
    //  eslint-disable no-unused-vars
    const wrapper = mount(

      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <div>
            <Dimmer active={false} id="pageLoader">
              <Loader size='big'>Loading</Loader>
            </Dimmer>
            <UserAccount
              {...props}
              currentView={props.currentView}
              enterUserAccount={enterUserAccountAction}
              leaveUserAccount={() => { }}
            >
            </UserAccount>
          </div>
        </I18nextProvider>
      </MemoryRouter>
      , { attachTo: window.domNode });

    let accountDetails = employeeWithDependentEmailsSet.employee;

    if (employeeWithDependentEmailsSet.employee == null) {
      accountDetails = employeeWithDependentEmailsSet.dependent;
    }


    wrapper.find('UserAccount').instance().setState({ accountDetails: accountDetails });
    wrapper.update();

    // eslint-enable no-unused-vars 
    expect(wrapper.find('a')).to.have.length(2);

    //On deactivate account link click
    shallow(wrapper.find('a').get(0)).simulate('click');
    wrapper.update();

    shallow(wrapper.find('#acceptButton').get(0)).simulate('click');
  });


  it('employeeWithDependentEmailsSet: AFTER CLICK ACTIVATE ACCOUNT LINK, CLICK ON ACCEPT BUTTON IN THE CONFIRM POPUP', () => {
    const enterUserAccountAction = sinon.spy(); // called on componentDidMount
    //  eslint-disable no-unused-vars
    const wrapper = mount(

      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <div>
            <Dimmer active={false} id="pageLoader">
              <Loader size='big'>Loading</Loader>
            </Dimmer>
            <UserAccount
              {...props}
              currentView={props.currentView}
              enterUserAccount={enterUserAccountAction}
              leaveUserAccount={() => { }}
            >
            </UserAccount>
          </div>
        </I18nextProvider>
      </MemoryRouter>
      , { attachTo: window.domNode });

    let accountDetails = employeeWithDependentEmailsSet.employee;

    if (employeeWithDependentEmailsSet.employee == null) {
      accountDetails = employeeWithDependentEmailsSet.dependent;
    }

    wrapper.find('UserAccount').instance().setState({ accountDetails: accountDetails });
    wrapper.update();

    // eslint-enable no-unused-vars 
    expect(wrapper.find('a')).to.have.length(2);

    //On activate account link click
    shallow(wrapper.find('a').get(1)).simulate('click');
    wrapper.update();

    shallow(wrapper.find('#acceptButton').get(0)).simulate('click');
  });


  it('employeeWithDependentEmailsNotSet: AFTER CLICK ACTIVATE ACCOUNT LINK, CLICK ON ACCEPT BUTTON IN THE CONFIRM POPUP', () => {

    auth.setUserInfo(employeeWithDependentEmailsNotSet);

    const enterUserAccountAction = sinon.spy(); // called on componentDidMount
    //  eslint-disable no-unused-vars
    const wrapper = mount(

      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <div>
            <Dimmer active={false} id="pageLoader">
              <Loader size='big'>Loading</Loader>
            </Dimmer>
            <UserAccount
              {...props}
              currentView={props.currentView}
              enterUserAccount={enterUserAccountAction}
              leaveUserAccount={() => { }}
              store={store}
            >
            </UserAccount>
          </div>
        </I18nextProvider>
      </MemoryRouter>
      , { attachTo: window.domNode });

    let accountDetails = employeeWithDependentEmailsNotSet.employee;

    if (employeeWithDependentEmailsNotSet.employee == null) {
      accountDetails = employeeWithDependentEmailsNotSet.dependent;
    }

    wrapper.find('UserAccount').instance().setState({ accountDetails: accountDetails });
    wrapper.update();

    // eslint-enable no-unused-vars 
    expect(wrapper.find('a')).to.have.length(2);

    //On activate account link click
    shallow(wrapper.find('a').get(1)).simulate('click');
    wrapper.update();

    wrapper.find('#acceptButton').simulate('click');
    wrapper.update();

    // Renders and Opens up ActivateDependent popup
    // Set value of newPassword on change
    const email = wrapper.find('#email');
    email.simulate('change', { target: { name: "email", value: 'abc@xyz.com' } });
    email.simulate('blur');
  });


  it('should call leaveUserAccount action', () => {
    const leaveUserAccountAction = sinon.spy(); // called on componentDidMount
    const wrapper = mount(
      <MemoryRouter>
        <I18nextProvider i18n={i18n}>
          <div>
            <Dimmer active={false} id="pageLoader">
              <Loader size='big'>Loading</Loader>
            </Dimmer>
            <UserAccount
              {...props}
              currentView={props.currentView}
              enterUserAccount={() => { }}
              leaveUserAccount={leaveUserAccountAction}
            />
          </div>
        </I18nextProvider>
      </MemoryRouter>
      , { attachTo: window.domNode });
    wrapper.unmount();
    expect(leaveUserAccountAction).to.have.property('callCount', 1);
  });
});
