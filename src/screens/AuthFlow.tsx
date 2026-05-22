import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

const logoElephant = require('../../assets/funfanti-elephant.png');
const logoWordmark = require('../../assets/funfanti-wordmark.png');

const palette = {
  primary: '#269D54',
  navy: '#081245',
  black: '#020202',
  blackSoft: '#161616',
  white: '#FFFFFF',
  error: '#DC2626',
};

type AuthFlowProps = {
  screen: 'auth-select' | 'login-method' | 'register' | 'login' | 'auth-success';
  loginEmail: string;
  loginPassword: string;
  registerEmail: string;
  registerPassword: string;
  registerConfirmPassword: string;
  registerName: string;
  authLoading: boolean;
  authError: string | null;
  onChangeLoginEmail: (value: string) => void;
  onChangeLoginPassword: (value: string) => void;
  onChangeRegisterEmail: (value: string) => void;
  onChangeRegisterPassword: (value: string) => void;
  onChangeRegisterConfirmPassword: (value: string) => void;
  onChangeRegisterName: (value: string) => void;
  onBackToIntro: () => void;
  onGoToLoginMethod: () => void;
  onGoToRegisterMethod: () => void;
  onGoToLogin: () => void;
  onGoToRegister: () => void;
  onSubmitRegister: () => void;
  onSubmitLogin: () => void;
  onCompleteSuccess: () => void;
};

export function AuthFlow({
  screen,
  loginEmail,
  loginPassword,
  registerEmail,
  registerPassword,
  registerConfirmPassword,
  registerName,
  authLoading,
  authError,
  onChangeLoginEmail,
  onChangeLoginPassword,
  onChangeRegisterEmail,
  onChangeRegisterPassword,
  onChangeRegisterConfirmPassword,
  onChangeRegisterName,
  onBackToIntro,
  onGoToLoginMethod,
  onGoToRegisterMethod,
  onGoToLogin,
  onGoToRegister,
  onSubmitRegister,
  onSubmitLogin,
  onCompleteSuccess,
}: AuthFlowProps) {
  const showUnsupportedProvider = (provider: string) => {
    Alert.alert(`${provider} sign-in`, 'This backend currently supports email and password authentication only.');
  };

  const renderLogo = () => (
    <View style={styles.logoBlock}>
      <Image source={logoElephant} style={styles.logoElephant} resizeMode="contain" />
      <Image source={logoWordmark} style={styles.logoWordmark} resizeMode="contain" />
    </View>
  );

  const renderMethodButton = (label: string, onPress: () => void) => (
    <Pressable style={({ pressed }) => [styles.methodButton, pressed && styles.pressed]} onPress={onPress}>
      <Text style={styles.methodButtonText}>{label}</Text>
    </Pressable>
  );

  const renderBackButton = () => (
    <Pressable style={styles.backButton} onPress={onBackToIntro}>
      <Feather name="chevron-left" size={24} color={palette.black} />
      <Text style={styles.backText}>Back</Text>
    </Pressable>
  );

  if (screen === 'auth-success') {
    return (
      <View style={styles.successScreen}>
        <View style={styles.successCircle}>
          <Feather name="check" size={66} color={palette.white} />
        </View>
        <Text style={styles.successTitle}>You're All Set!</Text>
        <Pressable style={styles.successHitArea} onPress={onCompleteSuccess} />
      </View>
    );
  }

  if (screen === 'auth-select' || screen === 'login-method') {
    const isLoginMethod = screen === 'login-method';

    return (
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.methodContainer}>
          {renderLogo()}
          <Text style={styles.methodTitle}>{isLoginMethod ? 'Login Account' : 'Create Account'}</Text>

          <View style={styles.methodStack}>
            {renderMethodButton(
              isLoginMethod ? 'Login with E-mail or Phone number' : 'Register with E-mail or Phone number',
              isLoginMethod ? onGoToLogin : onGoToRegister,
            )}
            {renderMethodButton(isLoginMethod ? 'Login with Google' : 'Register with Google', () => showUnsupportedProvider('Google'))}
            {renderMethodButton(isLoginMethod ? 'Login with Apple' : 'Register with Apple', () => showUnsupportedProvider('Apple'))}
            {renderMethodButton(isLoginMethod ? 'Login with Facebook' : 'Register with Facebook', () => showUnsupportedProvider('Facebook'))}
          </View>

          <View style={styles.methodFooter}>
            <Text style={styles.methodFooterText}>
              {isLoginMethod ? "Don't have an account?" : 'Already have an account?'}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.smallOutlineButton, pressed && styles.pressed]}
              onPress={isLoginMethod ? onGoToRegisterMethod : onGoToLoginMethod}
            >
              <Text style={styles.smallOutlineText}>{isLoginMethod ? 'Create Account' : 'Login'}</Text>
              <Feather name="chevron-right" size={22} color={palette.black} />
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (screen === 'register') {
    return (
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
          {renderBackButton()}
          <Text style={styles.formTitle}>{`Create your\naccount`}</Text>
          <TextInput
            style={[styles.input, styles.inputActive]}
            value={registerEmail}
            onChangeText={(value) => {
              onChangeRegisterEmail(value);
              if (!registerName) {
                onChangeRegisterName(value.split('@')[0]);
              }
            }}
            placeholder="john.doe@gmail.com"
            placeholderTextColor="#7d7d7d"
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <TextInput
            style={styles.input}
            value={registerPassword}
            onChangeText={onChangeRegisterPassword}
            placeholder="Password"
            placeholderTextColor="#7d7d7d"
            secureTextEntry
            textContentType="newPassword"
          />
          <TextInput
            style={styles.input}
            value={registerConfirmPassword}
            onChangeText={onChangeRegisterConfirmPassword}
            placeholder="Confirm password"
            placeholderTextColor="#7d7d7d"
            secureTextEntry
            textContentType="newPassword"
          />
          {authError ? <Text style={styles.errorText} selectable>{authError}</Text> : null}
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, authLoading && styles.disabled]}
            onPress={onSubmitRegister}
            disabled={authLoading}
          >
            {authLoading ? <ActivityIndicator color={palette.white} /> : <Text style={styles.primaryButtonText}>Create Account</Text>}
          </Pressable>
          <Text style={styles.legalText} selectable>
            By clicking "Create Account" your email address will be saved as your sign in account and you agree to our{' '}
            <Text style={styles.legalLink}>Term & Conditions</Text> and <Text style={styles.legalLink}>Privacy Policy</Text>
          </Text>
        </ScrollView>
      </View>
    );
  }

  if (screen === 'login') {
    return (
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.loginFormContainer} keyboardShouldPersistTaps="handled">
          {renderBackButton()}
          <Text style={styles.formTitle}>Login to your account</Text>
          <TextInput
            style={styles.input}
            value={loginEmail}
            onChangeText={onChangeLoginEmail}
            placeholder="john.doe@gmail.com"
            placeholderTextColor="#7d7d7d"
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <TextInput
            style={styles.input}
            value={loginPassword}
            onChangeText={onChangeLoginPassword}
            placeholder="Password"
            placeholderTextColor="#7d7d7d"
            secureTextEntry
            textContentType="password"
          />
          {authError ? <Text style={styles.errorText} selectable>{authError}</Text> : null}
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, authLoading && styles.disabled]}
            onPress={onSubmitLogin}
            disabled={authLoading}
          >
            {authLoading ? <ActivityIndicator color={palette.white} /> : <Text style={styles.primaryButtonText}>Login</Text>}
          </Pressable>
          <Pressable style={styles.secondaryLink} onPress={() => showUnsupportedProvider('Password reset')}>
            <Text style={styles.secondaryLinkText}>Forget Password</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: palette.white,
  },
  methodContainer: {
    minHeight: 852,
    alignItems: 'center',
    paddingTop: 109,
    paddingHorizontal: 16,
    paddingBottom: 42,
  },
  logoBlock: {
    alignItems: 'center',
    height: 232,
    width: 236,
  },
  logoElephant: {
    width: 178,
    height: 128,
  },
  logoWordmark: {
    width: 204,
    height: 136,
    marginTop: -31,
  },
  methodTitle: {
    color: palette.black,
    fontSize: 30,
    lineHeight: 40,
    fontWeight: '400',
    textAlign: 'center',
  },
  methodStack: {
    width: '100%',
    maxWidth: 297,
    gap: 12,
    marginTop: 17,
  },
  methodButton: {
    height: 48,
    borderWidth: 1.5,
    borderColor: palette.black,
    borderRadius: 360,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  methodButtonText: {
    color: palette.black,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
    textAlign: 'center',
  },
  methodFooter: {
    marginTop: 95,
    alignItems: 'center',
    gap: 14,
  },
  methodFooterText: {
    color: palette.black,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  smallOutlineButton: {
    minWidth: 86,
    height: 40,
    borderWidth: 1,
    borderColor: palette.black,
    borderRadius: 360,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingLeft: 16,
    paddingRight: 8,
  },
  smallOutlineText: {
    color: palette.black,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
  },
  formContainer: {
    minHeight: 852,
    paddingHorizontal: 16,
    paddingTop: 68,
    paddingBottom: 40,
  },
  loginFormContainer: {
    minHeight: 852,
    paddingHorizontal: 16,
    paddingTop: 68,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  backText: {
    color: palette.black,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  formTitle: {
    marginTop: 26,
    marginBottom: 43,
    color: palette.black,
    fontSize: 36,
    lineHeight: 48,
    fontWeight: '400',
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.black,
    borderRadius: 360,
    paddingHorizontal: 20,
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 21,
    color: palette.black,
  },
  inputActive: {
    borderWidth: 1.5,
    borderColor: palette.navy,
  },
  primaryButton: {
    marginTop: 24,
    height: 56,
    width: '100%',
    borderRadius: 360,
    backgroundColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: palette.white,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  errorText: {
    color: palette.error,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: -4,
    marginBottom: 4,
  },
  legalText: {
    marginTop: 219,
    fontSize: 12,
    color: palette.black,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  legalLink: {
    color: palette.primary,
    fontWeight: '700',
  },
  secondaryLink: {
    marginTop: 25,
    alignItems: 'center',
  },
  secondaryLinkText: {
    color: palette.black,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  successScreen: {
    flex: 1,
    backgroundColor: palette.primary,
    alignItems: 'center',
    paddingTop: 304,
    paddingHorizontal: 16,
  },
  successCircle: {
    width: 127,
    height: 127,
    borderRadius: 64,
    borderWidth: 5,
    borderColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    color: palette.white,
    fontSize: 30,
    lineHeight: 40,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 48,
  },
  successHitArea: {
    ...StyleSheet.absoluteFillObject,
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.72,
  },
});
