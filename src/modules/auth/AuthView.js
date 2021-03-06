import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Keyboard,
  Platform,
  LayoutAnimation,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';

import { fonts, colors } from '../../styles';
import { TextInput, Button } from '../../components';
import { GoogleSignin } from '@react-native-community/google-signin';
import { GOOGLE_WEB_ID, GOOGLE_IOS_ID } from 'react-native-dotenv';

import {
  AccessToken,
  GraphRequest,
  GraphRequestManager,
  LoginManager,
} from 'react-native-fbsdk';

const FORM_STATES = {
  LOGIN: 0,
  REGISTER: 1,
};

export default class AuthScreen extends React.Component {
  state = {
    anim: new Animated.Value(0),

    // Current visible form
    formState: FORM_STATES.LOGIN,
    isKeyboardVisible: false,

    user_id: '',
    password: '',

  };

  async componentDidMount() {

    await GoogleSignin.configure({
      iosClientId: GOOGLE_IOS_ID,
      webClientId: GOOGLE_WEB_ID,
      offlineAccess: false
    });

    this.keyboardDidShowListener = Keyboard.addListener(
      Platform.select({ android: 'keyboardDidShow', ios: 'keyboardWillShow' }),
      this._keyboardDidShow.bind(this),
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      Platform.select({ android: 'keyboardDidHide', ios: 'keyboardWillHide' }),
      this._keyboardDidHide.bind(this),
    );

    this._isGoogleSignedIn();

    this._isFBSignedIn();

    Animated.timing(this.state.anim, { toValue: 3000, duration: 3000 }).start();
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow() {
    LayoutAnimation.easeInEaseOut();
    this.setState({ isKeyboardVisible: true });
  }

  _keyboardDidHide() {
    LayoutAnimation.easeInEaseOut();
    this.setState({ isKeyboardVisible: false });
  }

  fadeIn(delay, from = 0) {
    const { anim } = this.state;
    return {
      opacity: anim.interpolate({
        inputRange: [delay, Math.min(delay + 500, 3000)],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
      transform: [
        {
          translateY: anim.interpolate({
            inputRange: [delay, Math.min(delay + 500, 3000)],
            outputRange: [from, 0],
            extrapolate: 'clamp',
          }),
        },
      ],
    };
  }

  processAuth() {

    const { user_id, password, formState } = this.state;
    const { signIn, signUp } = this.props;
    if (formState == FORM_STATES.LOGIN) {
      signIn(user_id, password);
    } else {
      signUp(user_id, password);
    }
  }

  signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      this.props.signIn_social();
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

  _isGoogleSignedIn = async () => {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      // alert('User is already signed in');
      //Get the User details as user is already signed in
      // this._getCurrentUserInfo();
      // const { signIn_social } = this.props;
      this.props.signIn_social();
    } else {
      // alert("Please Login");
      // console.log('Please Login');
    }
    // this.setState({ gettingLoginStatus: false });
  };

  loginWithFacebook = () => {
    // Attempt a login using the Facebook login dialog asking for default permissions.
    LoginManager.logInWithPermissions(['public_profile']).then(
      login => {
        if (login.isCancelled) {
          console.log('Login cancelled');
        } else {
          this.props.signIn_social();
          // AccessToken.getCurrentAccessToken().then(data => {
          //   const accessToken = data.accessToken.toString();
          //   this.getInfoFromToken(accessToken);
          // });
        }
      },
      error => {
        console.log('Login fail with error: ' + error);
      },
    );
  };

  _isFBSignedIn = async () => {

    const isSignedIn = await AccessToken.getCurrentAccessToken();
    if (isSignedIn) {
      // alert('User is already signed in');
      //Get the User details as user is already signed in
      // this._getCurrentUserInfo();
      // const { signIn_social } = this.props;
      this.props.signIn_social();
    } else {
      //alert("Please Login");
      // console.log('Please Login');
    }
    // this.setState({ gettingLoginStatus: false });
  };

  render() {
    const isRegister = this.state.formState === FORM_STATES.REGISTER;
    const { isError, isSignedUp } = this.props;
    return (
      <ImageBackground
        source={require('../../../assets/images/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <View style={[styles.section, { paddingTop: 30 }]}>
            <Animated.Image
              resizeMode="contain"
              style={[
                styles.logo,
                this.state.isKeyboardVisible && { height: 90 },
                this.fadeIn(0),
              ]}
              source={require('../../../assets/images/rimorin_logo.png')}
            />
          </View>

          <Animated.View
            style={[styles.section, styles.middle, this.fadeIn(700, -20)]}
          >
            {/* <TextInput
              placeholder="Username"
              style={styles.textInput}
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={text => {this.setState({user_id : text})}}
            /> */}

            <TextInput
              placeholder="Email"
              style={styles.textInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={text => { this.setState({ user_id: text }) }}
            />

            {/* {this.state.formState === FORM_STATES.REGISTER && (
              <TextInput
                placeholder="Email"
                style={styles.textInput}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            )} */}

            <TextInput
              placeholder="Password"
              secureTextEntry
              style={styles.textInput}
              onChangeText={text => { this.setState({ password: text }) }}
            />

            <Animated.View
              style={[styles.section, styles.bottom, this.fadeIn(700, -20)]}
            >

              {isSignedUp && (
                <Text
                  style={{
                    color: colors.primaryGradientEnd,
                    fontFamily: fonts.primaryBold,
                    paddingBottom: 10
                  }}
                >
                  {'Account created. Pls check email for verification.'}
                </Text>
              )}
              {isError && (
                <Text
                  style={{
                    color: colors.secondary,
                    fontFamily: fonts.primaryBold,
                    paddingBottom: 10
                  }}
                >
                  {'Error with user credentials'}
                </Text>
              )}
              <Button
                bgColor={colors.secondary}
                textColor="white"
                rounded
                style={{ alignSelf: 'stretch', marginBottom: 10 }}
                caption={
                  this.state.formState === FORM_STATES.LOGIN
                    ? 'Login'
                    : 'Register'
                }
                onPress={() => this.processAuth()}
              />

              {!this.state.isKeyboardVisible && (
                <View style={styles.socialLoginContainer}>
                  <Button
                    style={styles.socialButton}
                    bgColor={colors.primary}
                    rounded
                    bordered
                    icon={require('../../../assets/images/google-plus.png')}
                    iconColor={colors.primary}
                    onPress={() => this.signIn()}
                  />
                  <Button
                    style={[styles.socialButton, styles.socialButtonCenter]}
                    bgColor={colors.primary}
                    rounded
                    bordered
                    icon={require('../../../assets/images/twitter.png')}
                    iconColor={colors.primary}
                    onPress={() => this.props.navigation.goBack()}
                  />
                  <Button
                    style={styles.socialButton}
                    bgColor={colors.primary}
                    rounded
                    bordered
                    icon={require('../../../assets/images/facebook.png')}
                    iconColor={colors.primary}
                    onPress={() => this.loginWithFacebook()}
                  />
                </View>
              )}

              {!this.state.isKeyboardVisible && (
                <TouchableOpacity
                  onPress={() => {
                    LayoutAnimation.spring();
                    this.setState({
                      formState: isRegister
                        ? FORM_STATES.LOGIN
                        : FORM_STATES.REGISTER,
                    });
                  }}
                  style={{ paddingTop: 30, flexDirection: 'row' }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: fonts.primaryRegular,
                    }}
                  >
                    {isRegister
                      ? 'Already have an account?'
                      : "Don't have an account?"}
                  </Text>
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: fonts.primaryBold,
                      marginLeft: 5,
                    }}
                  >
                    {isRegister ? 'Login' : 'Register'}
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </Animated.View>
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
  },
  backgroundImage: {
    flex: 1,
  },
  section: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 2,
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
  },
  bottom: {
    flex: 1,
    alignSelf: 'stretch',
    paddingBottom: Platform.OS === 'android' ? 30 : 0,
  },
  last: {
    justifyContent: 'flex-end',
  },
  textInput: {
    alignSelf: 'stretch',
    marginTop: 20,
  },
  logo: {
    height: 150,
  },
  socialLoginContainer: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginTop: 15,
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
  },
  socialButtonCenter: {
    marginLeft: 10,
    marginRight: 10,
  },
});
