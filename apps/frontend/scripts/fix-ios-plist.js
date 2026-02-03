import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const plistPath = path.join(__dirname, '../ios/App/App/Info.plist');

const privacyDescriptions = {
  NSPhotoLibraryUsageDescription: '상품 문의 및 리뷰 작성 시 사진을 첨부하기 위해 사진 라이브러리 접근 권한이 필요합니다.',
  NSCameraUsageDescription: '상품 문의 및 리뷰 작성 시 사진을 촬영하기 위해 카메라 접근 권한이 필요합니다.',
  NSPhotoLibraryAddUsageDescription: '촬영한 사진을 저장하기 위해 사진 라이브러리 저장 권한이 필요합니다.',
  NSFaceIDUsageDescription: '안전한 결제를 위해 Face ID 인증이 필요합니다.',
  NSUserTrackingUsageDescription: '더 나은 서비스 제공을 위해 앱 사용 데이터를 수집합니다. 수집된 데이터는 서비스 개선 목적으로만 사용됩니다.',
  NSMicrophoneUsageDescription: '동영상 촬영 시 오디오 녹음을 위해 마이크 접근 권한이 필요합니다.',
  NSLocationWhenInUseUsageDescription: '주변 매장 검색 및 배송지 설정을 위해 위치 정보가 필요합니다.',
  ITSAppUsesNonExemptEncryption: 'false'
};

function addPrivacyDescriptions() {
  if (!fs.existsSync(plistPath)) {
    console.error('❌ Info.plist not found at:', plistPath);
    console.log('Run "npx cap add ios" first to create iOS project.');
    process.exit(1);
  }

  let plistContent = fs.readFileSync(plistPath, 'utf8');
  let addedCount = 0;
  let existsCount = 0;

  for (const [key, value] of Object.entries(privacyDescriptions)) {
    if (!plistContent.includes(`<key>${key}</key>`)) {
      const insertPoint = plistContent.lastIndexOf('</dict>');
      if (insertPoint === -1) {
        console.error('❌ Invalid Info.plist format');
        process.exit(1);
      }
      
      let newEntry;
      if (value === 'true' || value === 'false') {
        newEntry = `\t<key>${key}</key>\n\t<${value}/>\n`;
      } else {
        newEntry = `\t<key>${key}</key>\n\t<string>${value}</string>\n`;
      }
      
      plistContent = plistContent.slice(0, insertPoint) + newEntry + plistContent.slice(insertPoint);
      console.log(`✅ Added: ${key}`);
      addedCount++;
    } else {
      console.log(`⏭️  Already exists: ${key}`);
      existsCount++;
    }
  }

  fs.writeFileSync(plistPath, plistContent, 'utf8');
  console.log('');
  console.log(`📝 Info.plist updated successfully!`);
  console.log(`   Added: ${addedCount}, Already existed: ${existsCount}`);
  console.log(`   Path: ${plistPath}`);
}

addPrivacyDescriptions();
