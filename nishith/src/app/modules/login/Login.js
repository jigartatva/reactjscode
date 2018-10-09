// ---- IMPORTS ----
import React from 'react';
import { Button, Modal, Form } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { translate } from 'react-i18next';
import { parseGraphQLErrorMessage } from '../../utilities/commonFunctions';
import { USER_ACTIVATED } from '../../utilities/constant';

// SVG for close icon
const closeIconSVG =
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

// SVG for check icon
const checkSVG =
  <i className="check">
    <svg width="14px" height="11px" viewBox="0 0 14 11" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
      <g id="Page-1" stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
        <g id="check" transform="translate(0.000000, -1.000000)" fill="#A6E50F">
          <path d="M12.845,3.878 L12.845,3.878 L11.178,5.57 L11.178,5.57 L6.178,10.647 L6.178,10.647 C5.877,10.953 5.46,11.142 5,11.142 C4.54,11.142 4.123,10.953 3.821,10.647 L3.821,10.647 L0.488,7.262 L0.488,7.262 C0.186,6.956 0,6.533 0,6.066 C0,5.131 0.746,4.373 1.666,4.373 C2.127,4.373 2.543,4.562 2.845,4.869 L2.845,4.869 L5,7.057 L8.821,3.176 L10.488,1.484 L10.488,1.484 C10.789,1.178 11.206,0.989 11.666,0.989 C12.587,0.989 13.333,1.747 13.333,2.681 C13.333,3.148 13.147,3.571 12.845,3.878 L12.845,3.878 Z" id="Shape" />
        </g>
      </g>
    </svg>
  </i>

// REGEX for email validation
const regExp = new RegExp(['^(([^<>()\\[\\]\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\.,;:\\s@"]+)*)',    // eslint-disable-line
  '|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])',
  '|(([a-zA-ZÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜŸäëïöüŸ¡¿çÇŒœßØøÅåÆæÞþÐð:\\-0-9]+\\.)',
  '+[a-zA-ZÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜŸäëïöüŸ¡¿çÇŒœßØøÅåÆæÞþÐð:]{2,}))$'].join(''));

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = { email: '', password: '', formError: false, emailError: 0, passwordError: 0, errorMessage: '' };
  }


  // Validates email
  validateEmail() { return regExp.test(this.state.email); }

  // Checks & Validate Email
  checkEmail() {
    if (this.state.email.length == 0 || !this.validateEmail()) {
      this.setState({ emailError: 1 }); return false;
    } else { this.setState({ emailError: 2, formError: false }); return true; }
  }

  // Validate password
  checkPassword() {
    if (this.state.password.length < 6) { this.setState({ passwordError: 1 }); return false; }
    this.setState({ passwordError: 2, formError: false }); return true;
  }

  // Checks both email and password
  isValidate() { return !((!this.checkEmail()) || (!this.checkPassword())) }

  // On email input change
  handlesOnEmailChange(event) {
    event.preventDefault(); this.setState({ email: event.target.value });
  }

  // On password change
  handlesOnPasswordChange(event) {
    event.preventDefault(); this.setState({ password: event.target.value });
  }

  // On login click
  handlesOnLogin(event) {
    event.preventDefault();
    if (this.isValidate()) {
      const { loginUser, history, t } = this.props;
      const { email, password } = this.state;

      Promise.all([loginUser({ email: email, password: password }),]).then(() => {
        history.replace('/home');
      }).catch((err) => {
        let errorMsg = parseGraphQLErrorMessage(err, t, "login");
        if (errorMsg == USER_ACTIVATED) { errorMsg = t('login.inactiveUser'); }
        this.setState({ emailError: 1, passwordError: 1, formError: true, errorMessage: errorMsg });
      });
    }
  }

  render() {
    const { mutationLoading, t } = this.props;
    const { email, password, formError, emailError, passwordError, errorMessage } = this.state;

    return (
      <Modal open={this.props.isOpen} onClose={this.props.onClose} className="login-modal modal-data" closeIcon={closeIconSVG}>
        {/* Modal heading section */}
        <Modal.Header>
          <h3>{t('login.title')}</h3>
        </Modal.Header>
        {/* Modal content section */}
        <Modal.Content>
          <Form onSubmit={this.handlesOnLogin}>
            <Form.Field className={'form-group'} required>
              <input type="text"
                id="formFieldEmail"
                ref="inputEmail"
                placeholder={t('login.username')}
                value={email}
                onChange={this.handlesOnEmailChange}
                onBlur={() => this.checkEmail()}
                className="form-control" />
              {checkSVG}
              {!formError && emailError != 2 && emailError != 0 && <em>{t('formErrors.emailInvalid')}</em>}
            </Form.Field>
            <Form.Field className={'form-group'} required>
              <input ref="inputPassword"
                id="formFieldPassword"
                type='password'
                placeholder={t('login.password')}
                value={password}
                onChange={this.handlesOnPasswordChange}
                onBlur={() => { this.checkPassword() }}
                className="form-control" />
              {checkSVG}
              {!formError && passwordError != 2 && passwordError != 0 && <em>{t('formErrors.passwordBlank')}</em>}
              {formError && <em>{errorMessage}</em>}
            </Form.Field>
            <Form.Field className="clearfix form-wrap">
              <Button
                type="submit"
                title={t('login.title')}
                disabled={mutationLoading}
                loading={mutationLoading}
                className="btn">
                {t('login.title')}
              </Button>
              <span className="forgot-link">
                <Link to={'/forgot-password'} title={t('login.forgotLink')}> {t('login.forgotLink')} </Link>
              </span>
            </Form.Field>
          </Form>
        </Modal.Content>
        {/* Modal actions section */}
        <Modal.Actions>
          <p>{t('login.accountText')}
            <Link to={'/signup'} title={t('links.signUp')}> {t('links.signUp')} </Link>
          </p>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default translate('translations')(Login);
