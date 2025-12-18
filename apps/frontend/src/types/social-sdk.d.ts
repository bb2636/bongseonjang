declare namespace Kakao {
  function init(appKey: string): void;
  function isInitialized(): boolean;
  function cleanup(): void;

  namespace Auth {
    function authorize(settings: {
      redirectUri: string;
      scope?: string;
      prompt?: string;
      loginHint?: string;
      nonce?: string;
      state?: string;
      throughTalk?: boolean;
    }): void;

    function logout(callback?: () => void): void;

    function getAccessToken(): string | null;

    function setAccessToken(token: string): void;
  }

  namespace API {
    function request<T = unknown>(settings: {
      url: string;
      data?: Record<string, unknown>;
      files?: File[];
      success?: (response: T) => void;
      fail?: (error: unknown) => void;
      always?: () => void;
    }): Promise<T>;
  }
}

declare namespace naver {
  class LoginWithNaverId {
    constructor(options: {
      clientId: string;
      callbackUrl: string;
      isPopup?: boolean;
      loginButton?: {
        color?: 'green' | 'white';
        type?: 1 | 2 | 3;
        height?: number;
      };
      callbackHandle?: boolean;
    });

    init(): void;
    getLoginStatus(callback: (status: boolean) => void): void;
    logout(): void;
    generateAuthorizeUrl(): string;

    user: {
      getEmail(): string | undefined;
      getName(): string | undefined;
      getNickName(): string | undefined;
      getProfileImage(): string | undefined;
      getId(): string | undefined;
      getAge(): string | undefined;
      getBirthday(): string | undefined;
      getGender(): string | undefined;
    };

    accessToken: {
      accessToken: string;
      tokenType: string;
    };
  }
}

interface Window {
  Kakao: typeof Kakao;
  naver: typeof naver;
}
