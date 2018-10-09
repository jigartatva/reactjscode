// Imports
import React from 'react';
import { translate } from 'react-i18next';
import client from '../../../services/apollo';
import { auth } from '../../../services/auth';
import { Modal, Button } from 'semantic-ui-react';
import * as commonFunctions from '../../../utilities/commonFunctions';
import FormMessage from '../../../components/formMessage/FormMessage';
import ActivateDependent from '../../activateDependent';
import activateDependentMutation from '../../../gql/mutations/activateDependent.gql';
import deactivateDependentMutation from '../../../gql/mutations/deactivateDependent.gql';
import currentUserDetailsQuery from '../../../gql/queries/currentUserDetails.gql';

class UserAccount extends React.Component {

  constructor(props) {
    super(props);

    this.fetchData = this.fetchData.bind(this);
    this.handleClickActivateDependentAccount = this.handleClickActivateDependentAccount.bind(this);
    this.handleClickDeactivateDependentAccount = this.handleClickDeactivateDependentAccount.bind(this);
    this.showHideConfirmModal = this.showHideConfirmModal.bind(this);
    this.openActivateDependentPopup = this.openActivateDependentPopup.bind(this);
    this.finishedActivateDependentPopup = this.finishedActivateDependentPopup.bind(this);

    this.state = {
      user: null,
      accountDetails: null,
      confirmModalType: '',
      isOpenConfirmModal: false,
      currentDependent: null,
      isOpenActivateDependentPopup: false,
      buttonDisabled: false,
      showCommonErrorMessage: false,
      commonErrorMessage: ''
    };
  }

  componentDidMount() {
    const { enterUserAccount } = this.props;
    enterUserAccount();

    this.fetchData();
  }

  componentWillUnmount() {
    const { leaveUserAccount } = this.props;
    leaveUserAccount();
  }

  fetchData() {
    const { t } = this.props;

    commonFunctions.showPageLoader();

    client.query({
      query: currentUserDetailsQuery,
      fetchPolicy: 'network-only'
    }).
      then((response) => {
        const user = response.data.user;
        auth.setUserInfo(user);

        // For the employee user, the account details would be retrieved from user.employee and for the dependent user the details would be fetched from user.dependent
        let accountDetails = user.employee;

        if (user.employee === null) {
          accountDetails = user.dependent;
        }

        this.setState({
          user: user,
          accountDetails: accountDetails,
          showCommonErrorMessage: false,
          commonErrorMessage: ''
        });

        commonFunctions.hidePageLoader();
      }).
      catch((err) => {
        const errorMsg = commonFunctions.parseGraphQLErrorMessage(err, t);

        this.setState({
          showCommonErrorMessage: true,
          commonErrorMessage: errorMsg
        });

        commonFunctions.hidePageLoader();
      });
  }

  // Will be called onclick of Activate Account link
  handleClickActivateDependentAccount() {
    const { t } = this.props;
    const dependent = this.state.currentDependent;

    this.setState({
      buttonDisabled: true
    });
    client.mutate({
      mutation: activateDependentMutation,
      variables: {
        email: dependent.email,
        personCode: dependent.personCode
      }
    }).
      then(() => {
        this.setState({
          isOpenConfirmModal: false,
          currentDependent: null,
          buttonDisabled: false,
          showCommonErrorMessage: false,
          commonErrorMessage: ''
        });
        this.fetchData();
      }).
      catch((err) => {
        const errorMsg = commonFunctions.parseGraphQLErrorMessage(err, t);

        this.setState({
          isOpenConfirmModal: false,
          currentDependent: null,
          buttonDisabled: false,
          showCommonErrorMessage: true,
          commonErrorMessage: errorMsg
        });
      });
  }

  // Will be called onclick of Accept button in confirm deactivate modal
  handleClickDeactivateDependentAccount() {
    const { t } = this.props;
    const dependent = this.state.currentDependent;

    this.setState({
      buttonDisabled: true
    });

    client.mutate({
      mutation: deactivateDependentMutation,
      variables: {
        email: dependent.email
      }
    }).
      then(() => {
        this.setState({
          isOpenConfirmModal: false,
          currentDependent: null,
          buttonDisabled: false,
          showCommonErrorMessage: false,
          commonErrorMessage: ''
        });
        this.fetchData();
      }).
      catch((err) => {
        const errorMsg = commonFunctions.parseGraphQLErrorMessage(err, t);

        this.setState({
          isOpenConfirmModal: false,
          currentDependent: null,
          buttonDisabled: false,
          showCommonErrorMessage: true,
          commonErrorMessage: errorMsg
        });
      });
  }

  // Show/hide "Confirm activate/deactivate" modal popup
  showHideConfirmModal(modalType, status, currentDependent = null) {
    this.setState({
      confirmModalType: modalType,
      isOpenConfirmModal: status,
      currentDependent: currentDependent
    });
  }

  // Will be called on "Accept" button click in Confirm Activate modal popup. Will Show and render "ActivateDependent" component modal popup when current dependent email will not be set
  openActivateDependentPopup() {
    const { currentDependent } = this.state;
    this.setState({
      isOpenConfirmModal: false,
      isOpenActivateDependentPopup: true,
      currentDependent: currentDependent
    });
  }

  // Will called by the ActivateDependent component when the activation process will be completed
  finishedActivateDependentPopup(action = null) {
    this.setState({
      currentDependent: null,
      isOpenActivateDependentPopup: false
    });

    if (action == "refetchData") {
      this.fetchData();
    }
  }

  render() {
    const { user,
      accountDetails,
      isOpenConfirmModal,
      confirmModalType,
      currentDependent,
      isOpenActivateDependentPopup,
      buttonDisabled,
      showCommonErrorMessage,
      commonErrorMessage } = this.state;
    const { t } = this.props;

    const dependents = (accountDetails && accountDetails.dependents)
      ? accountDetails.dependents.map(dependent => <div className="account-row" key={dependent.person_id}>
        <h4 style={{ marginBottom: '-7px' }}>{dependent.first_name} {dependent.last_name}</h4>
        <h4>{dependent.relationship}</h4>
        <h4>{dependent.email}</h4>

        {/* IF DEPENDENT EMAIL IS NOT SET */}
        {(!dependent.email) &&
          <a
            title={t('userAccount.activateAccountLink')}
            onClick={() => this.showHideConfirmModal("activate", true, dependent)}
            className="ui button" role="button">
            {t('userAccount.activateAccountLink')}
          </a>
        }

        {/* IF DEPENDENT EMAIL IS SET */}
        {(dependent.email && dependent.active == false) &&
          <a
            title={t('userAccount.activateAccountLink')}
            onClick={() => this.showHideConfirmModal("activate", true, dependent)}
            className="ui button" role="button">
            {t('userAccount.activateAccountLink')}
          </a>
        }

        {(dependent.email && dependent.active == true) &&
          <a
            title={t('userAccount.deactivateAccountLink')}
            onClick={() => this.showHideConfirmModal("deactivate", true, dependent)}
            className="ui button" role="button">
            {t('userAccount.deactivateAccountLink')}
          </a>
        }
      </div>)
      : [];

    return (
      <div className="ui segment dashboard-data">

        {/* COMMON ERROR MESSAGE SECTION */}
        {showCommonErrorMessage &&
          <div className="account active-account">
            <FormMessage visible error header={commonErrorMessage} />
          </div>
        }

        {/* ACTIVATE DEPENDENT MODAL POPUP WILL BE RENDERED WHEN THE DEPENDENT EMAIL WILL NOT BE SET */}
        {isOpenActivateDependentPopup &&
          <ActivateDependent
            isOpen={this.state.isOpenActivateDependentPopup}
            fromPage="accountPage"
            currentDependent={currentDependent}
            activationFinished={this.finishedActivateDependentPopup}
            {...this.props}
          />}

        {/* CONFIRM ACTIVATE/DEACTIVATE MODAL POPUP */}
        {(isOpenConfirmModal && currentDependent) &&
          <Modal
            open={isOpenConfirmModal}
            onClose={() => this.showHideConfirmModal('', false)}
            className="ui modal account-modal active-depent modal-data"
            closeIcon={
              <i className="close">
                <svg width="12px" height="12px" viewBox="0 0 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                  <g id="Page-1" stroke="none" strokeWidth={1} fill="none" fillRule="evenodd" strokeLinecap="round">
                    <g id="Group" transform="translate(-8.000000, -8.000000)" stroke="#7E7E7E" strokeWidth="1.5">
                      <g id="Close">
                        <path d="M9,18.982684 L18.982684,9" id="Line" />
                        <path d="M9,18.982684 L18.982684,9" id="Line" transform="translate(13.991342, 13.991342) scale(-1, 1) translate(-13.991342, -13.991342) " />
                      </g>
                    </g>
                  </g>
                </svg>
              </i>
            }>

            <Modal.Header>
              <h3>{confirmModalType == "deactivate"
                ? t('userAccount.confirmDeactivateDependentModalHeading')
                : t('userAccount.confirmActivateDependentModalHeading')}
              </h3>
            </Modal.Header>

            <Modal.Content>
              {(confirmModalType == "deactivate" && currentDependent) &&
                <p>{t('userAccount.confirmDeactivateDependentMessage')}</p>
              }
              {(confirmModalType == "activate" && currentDependent) &&
                <p>{t('userAccount.confirmActivateDependentMessage')}</p>
              }
              <div className="actions">
                <button
                  title={t('cancelButtonLabel')}
                  type="button" id="cancelButton"
                  className="ui button btn btn-primary"
                  onClick={() => this.showHideConfirmModal('', false)}>
                  {t('cancelButtonLabel')}
                </button>

                {confirmModalType == "deactivate" &&
                  <Button
                    title={t('acceptButtonLabel')}
                    type="button" id="acceptButton"
                    disabled={buttonDisabled}
                    loading={buttonDisabled}
                    className="btn ui button"
                    onClick={this.handleClickDeactivateDependentAccount}>
                    {t('acceptButtonLabel')}
                  </Button>
                }

                {(confirmModalType == "activate" && currentDependent.email) &&
                  <Button
                    title={t('acceptButtonLabel')}
                    type="button"
                    id="acceptButton"
                    disabled={buttonDisabled}
                    loading={buttonDisabled}
                    className="btn ui button"
                    onClick={this.handleClickActivateDependentAccount}>
                    {t('acceptButtonLabel')}
                  </Button>
                }

                {(confirmModalType == "activate" && !currentDependent.email) &&
                  <button
                    title={t('acceptButtonLabel')}
                    type="button" id="acceptButton"
                    className="btn ui button"
                    onClick={this.openActivateDependentPopup}>
                    {t('acceptButtonLabel')}
                  </button>
                }
              </div>
            </Modal.Content>

          </Modal>
        }

        {accountDetails &&
          <span>
            <h1>{t('userAccount.pageTitle')}</h1>
            <div className="account active-account">

              {/* USER ID */}
              <div className="account-info">
                <h4>{t('userAccount.userIdLabel')}</h4>
                <h5>
                  {user.username}
                </h5>
              </div>

              {/* ADDRESS */}
              {(accountDetails.home_address_1) &&
                <div className="account-info">
                  <h4>{t('userAccount.homeLabel')}</h4>
                  <h5>
                    {accountDetails.home_address_1}
                    {(accountDetails.home_address_2 != "") ? (`, ${accountDetails.home_address_2}`) : ''}
                    {(accountDetails.city) ? (`, ${accountDetails.city}`) : ''}
                    {(accountDetails.zip) ? (` - ${accountDetails.zip}`) : ''}
                  </h5>
                </div>
              }

              {/* DEPENDENTS */}
              {dependents.length > 0 &&
                <div className="account-info">
                  <h4>{t('userAccount.dependentLabel')}</h4>
                  {dependents}
                </div>
              }

              {/* BENEFIT PLAN  */}
              {accountDetails.benefit_plan_name &&
                <div className="account-info">
                  <h4>{t('userAccount.planLabel')}</h4>
                  <h5>{accountDetails.benefit_plan_name}</h5>
                </div>
              }

              {/* DEDUCTIBLE REMAINING */}
              {accountDetails.deductible_remaining &&
                <div className="account-info">
                  <h4>{t('userAccount.deductibleLabel')}</h4>
                  <h5>{accountDetails.deductible_remaining}</h5>
                </div>
              }

              <h4>{t('userAccount.contactHRText')}</h4>

            </div>
          </span>
        }
      </div>
    );
  }

}

export default translate('translations')(UserAccount);
