import React from 'react';
import { Accounts, STATES } from 'meteor/std:accounts-ui';
import * as UI from 'material-ui';
import * as SvgIcon from 'material-ui/svg-icons';
import * as Styles from 'material-ui/styles';
import { t9n } from 't9n'
//import Alerts from './Alerts.jsx' Move into that repository

STATES.VERIFY_PHONE = 'verifyPhoneNumber';
STATES.FINISH = 'finish';

/**
 * Form.propTypes = {
 *   fields: React.PropTypes.object.isRequired,
 *   buttons: React.PropTypes.object.isRequired,
 *   error: React.PropTypes.string,
 *   ready: React.PropTypes.bool
 * };
 */
class Form extends Accounts.ui.Form {
  render() {
    const { fields, buttons, error, message, ready } = this.props;
    if (!ready) return <UI.CircularProgress />;

    return (
      <form  onSubmit={ evt => evt.preventDefault() }>
        {Object.keys(fields).length > 0 ? (
          <Accounts.ui.Fields fields={ fields } />
        ): null }
        {_.values(_.omit(buttons, 'switchToPasswordReset', 'switchToSignIn',
          'switchToSignUp', 'switchToChangePassword', 'switchToSignOut', 'signOut')).map((button, i) =>
          <Button {...button} key={i} />
        )}
        { buttons['signOut'] ? (
          <Button {...buttons['signOut']} type="submit" />
        ): null }
        { buttons['switchToSignIn'] ? (
          <Button {...buttons['switchToSignIn']} type="button" />
        ): null }
        { buttons['switchToSignUp'] ? (
          <Button {...buttons['switchToSignUp']} type="button" />
        ): null }
        { buttons['switchToChangePassword'] ? (
          <Button {...buttons['switchToChangePassword']} type="button" />
        ): null }
        { buttons['switchToSignOut'] ? (
          <Button {...buttons['switchToSignOut']} type="button" />
        ): null }
        { buttons['switchToPasswordReset'] ? (
            <div className="field">
              <Accounts.ui.Button {...buttons['switchToPasswordReset']} />
            </div>
        ): null }
        <Accounts.ui.FormMessage className="ui message" style={{display: 'block'}} {...message} />
      </form>
    );
  }
}

class Buttons extends Accounts.ui.Buttons {}

class Button extends Accounts.ui.Button {
  render() {
    const {flat=false, label, type, disabled = false, onClick, className } = this.props;
    if (type == 'link')
        return (<a style={{cursor: 'pointer', padding: 5}} className={ className } onClick={ onClick }>{ label }</a>);

    var icon = type=='submit' ? <SvgIcon.ContentSend /> : undefined;
    if (flat)
      return <UI.FlatButton
          disabled={disabled} label={label} onClick={onClick}
          primary={type === 'submit'} icon={icon}/>;
    else
      return <UI.RaisedButton
          disabled={disabled} label={label} onClick={onClick}
          primary={type === 'submit'} icon={icon}/>;
  }
}

class Fields extends Accounts.ui.Fields {
  render () {
    let { fields = {} } = this.props;
    return (
      <UI.Paper zDepth={0}>
          {Object.keys(fields).map((id, i) =>
            <div key={i} style={{paddingBottom: 18}}>
              <Accounts.ui.Field {...fields[id]} />
            </div>
          )}
      </UI.Paper>
    );
  }
}

class Field extends Accounts.ui.Field {
  render() {
    const {
      id,
      hint,
      label,
      type = 'text',
      onChange,
      required = false,
      className,
      defaultValue = "",
      mask
    } = this.props;
    const { mount = true } = this.state;

    if (!mount) return null;

    if (mask) {
      return <UI.MaskedTextField
          id={ id }
          name={ id }
          type={ type }
          hintText={ hint }
          defaultValue={ defaultValue }
          onChange={ onChange }
          floatingLabelText={ label }
          mask={mask}
          />;
    } else {
      return <UI.TextField
          id={ id }
          name={ id }
          type={ type }
          hintText={ hint }
          defaultValue={ defaultValue }
          onChange={ onChange }
          floatingLabelText={ label }
          />;
    }
  }
}

class LoginForm extends Accounts.ui.LoginForm {

  constructor(props) {
    super(props);
    //this.state = {
    //  formState: STATES.VERIFY_PHONE
    //};
    console.log(props);
    console.log(this.state);
  }

  fields() {
    const { formState } = this.state;
    const fields = super.fields();

    const phonenumber = {
      id: 'phonenumber',
      hint: t9n('loginForm.phoneNumberHint'),
      label: t9n('loginForm.phoneNumber'),
      type: 'phonenumber',
      mask: (v) => {
        if (v.length > 12) return '+999 (999) 999-9999';
        else if (v.length > 11) return '+99 (999) 999-9999';
        else return '+9 (999) 999-9999';
      },
      onChange: (e, phonenumber) => {this.setState({phonenumber})}
    };
    const verifyCode = {
        id: 'verifyCode',
        hint: t9n('loginForm.verifyCodeHint'),
        label: t9n('loginForm.verifyCode'),
        mask: '999999',
        onChange: (code) => {this.setState({code})}
    };

    if (formState == STATES.SIGN_UP)
        return { phonenumber, ...fields };

    if (formState == STATES.VERIFY_PHONE)
        return { verifyCode };

    return fields;
  }


  onSubmitCode() {
    Meteor.call('SMS.checkVerifyCode', this.state.phonenumber, this.state.code, (err, res) => {
      if (res === true) {
        console.log('FINISH-FINISH');
        this.setState({
          ready: true,
          formState: STATES.FINISH
        });
        this.signUp(this.state);
      }
    });
  }

  //onRepeatCode() {
  //  this.setState({ready: false});
  //  Meteor.call('SMS.sendVerifyMessage', this.state.phonenumber, () => {
  //    this.setState({ready: true});
  //  });
  //}

  buttons() {
    const { formState } = this.state;
    const buttons = super.buttons();

    if (formState == STATES.VERIFY_PHONE) {
      buttons.GoBack = {
        id: 'goBack',
        label: t9n('loginForm.goBack'),
        //type: 'link',
        flat: true,
        onClick: () => {this.setState({formState: STATES.SIGN_UP})}
      };
      buttons.submitVerifyCode = {
        id: 'submitVerifyCode',
        label: t9n('loginForm.submitVerifyCode'),
        type: 'submit',
        onClick: this.onSubmitCode.bind(this)
      };
      //buttons.repeatVerifyCode = {
      //  id: 'repeatVerifyCode',
      //  label: t9n('loginForm.repeatVerifyCode'),
      //  onClick: this.onRepeatCode.bind(this)
      //};
    }

    return buttons;
  }

  signUp(options = {}) {
    const { phonenumber = null, formState } = this.state;
    if (phonenumber !== null) {
      options.profile = Object.assign(options.profile || {}, {
        phonenumber: phonenumber
      });
    }
    if (formState == STATES.SIGN_UP) {
      Meteor.call('SMS.sendVerifyMessage', this.state.phonenumber);
      //Alerts.show({message: t9n('sms.vefiryMessageSent', true, {phonenumber})}); return after add Alerts.jsx
      this.setState({formState: STATES.VERIFY_PHONE});
    }
    if (formState == STATES.FINISH) {
      super.signUp(options);
    }
  }
}

class FormMessage extends Accounts.ui.FormMessage {}

Accounts.ui.LoginForm = LoginForm;
Accounts.ui.Form = Form;
Accounts.ui.Buttons = Buttons;
Accounts.ui.Button = Button;
Accounts.ui.Fields = Fields;
Accounts.ui.Field = Field;
Accounts.ui.FormMessage = FormMessage;

export { Accounts, STATES };
export default Accounts;
