const CHANNEL_TALK_SCRIPT_SRC = 'https://cdn.channel.io/plugin/ch-plugin-web.js';
const CHANNEL_TALK_PLUGIN_KEY = '848cffc1-3dbf-4f84-8232-b5bbd66c92a3';

type ChannelIoFunction = {
  (...args: unknown[]): void;
  q?: unknown[][];
  c?: (args: unknown[]) => void;
};

type ChannelTalkUserProfile = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string | null;
};

declare global {
  interface Window {
    ChannelIO?: ChannelIoFunction;
  }
}

let channelTalkLoadPromise: Promise<void> | null = null;
let isChannelTalkBooted = false;

function createChannelTalkPlaceholder() {
  const channelIoPlaceholder: ChannelIoFunction = function (...args: unknown[]) {
    channelIoPlaceholder.c?.(args);
  };
  channelIoPlaceholder.q = [];
  channelIoPlaceholder.c = function (args: unknown[]) {
    channelIoPlaceholder.q?.push(args);
  };
  window.ChannelIO = channelIoPlaceholder;
}

function loadChannelTalkScript(): Promise<void> {
  if (channelTalkLoadPromise) {
    return channelTalkLoadPromise;
  }

  if (window.ChannelIO) {
    return Promise.resolve();
  }

  channelTalkLoadPromise = new Promise((resolve, reject) => {
    createChannelTalkPlaceholder();

    const scriptElement = document.createElement('script');
    scriptElement.async = true;
    scriptElement.src = CHANNEL_TALK_SCRIPT_SRC;
    scriptElement.charset = 'UTF-8';
    scriptElement.onload = () => resolve();
    scriptElement.onerror = () => {
      channelTalkLoadPromise = null;
      reject(new Error('Channel Talk 스크립트 로드에 실패했습니다.'));
    };

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(scriptElement, firstScript);
      return;
    }

    document.head.appendChild(scriptElement);
  });

  return channelTalkLoadPromise;
}

function buildBootOptions(profile?: ChannelTalkUserProfile | null) {
  const userProfile = profile
    ? {
        memberId: profile.id,
        name: profile.name,
        email: profile.email,
        mobileNumber: profile.phone ?? undefined,
      }
    : {};

  return Object.fromEntries(
    Object.entries({
      pluginKey: CHANNEL_TALK_PLUGIN_KEY,
      ...userProfile,
    }).filter(([, value]) => value !== undefined && value !== null),
  );
}

export async function bootChannelTalk(profile?: ChannelTalkUserProfile | null) {
  await loadChannelTalkScript();

  if (!window.ChannelIO) {
    throw new Error('Channel Talk 초기화에 실패했습니다.');
  }

  if (isChannelTalkBooted) {
    window.ChannelIO('shutdown');
    isChannelTalkBooted = false;
  }

  const bootOptions = buildBootOptions(profile);
  window.ChannelIO('boot', bootOptions);
  isChannelTalkBooted = true;
}

export function shutdownChannelTalk() {
  if (!isChannelTalkBooted || !window.ChannelIO) {
    return;
  }

  window.ChannelIO('shutdown');
  isChannelTalkBooted = false;
}

export function openChannelTalk() {
  if (!window.ChannelIO) {
    console.error('Channel Talk이 초기화되지 않았습니다.');
    return;
  }

  window.ChannelIO('showMessenger');
}
