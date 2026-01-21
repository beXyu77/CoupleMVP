export type AuthStackParamList = {
  Login: undefined;
  RegisterEmail: undefined;
  VerifyCode: {
    email: string;
    nickname: string;
  };
  SetPassword: {
    email: string;
    nickname: string;
  };
};