interface DaumPostcodeData {
  zonecode: string;
  address: string;
  addressType: 'R' | 'J';
  roadAddress: string;
  jibunAddress: string;
  bname: string;
  buildingName: string;
  apartment: 'Y' | 'N';
  userSelectedType: 'R' | 'J';
}

interface DaumPostcodeOptions {
  oncomplete: (data: DaumPostcodeData) => void;
  onclose?: () => void;
  width?: string | number;
  height?: string | number;
}

interface DaumPostcode {
  new (options: DaumPostcodeOptions): {
    open: () => void;
    embed: (element: HTMLElement) => void;
  };
}

interface Daum {
  Postcode: DaumPostcode;
}

declare global {
  interface Window {
    daum: Daum;
  }
}

export {};
