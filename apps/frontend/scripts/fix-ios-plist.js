import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const plistPath = path.join(__dirname, '../ios/App/App/Info.plist');

const privacyDescriptions = {
  NSPhotoLibraryUsageDescription: '상품 문의 및 리뷰 작성 시 사진을 첨부하기 위해 사진 라이브러리 접근 권한이 필요합니다.',
  NSCameraUsageDescription: '상품 문의 및 리뷰 작성 시 사진을 촬영하기 위해 카메라 접근 권한이 필요합니다.',
  NSPhotoLibraryAddUsageDescription: '촬영한 사진을 저장하기 위해 사진 라이브러리 저장 권한이 필요합니다.'
};

function addPrivacyDescriptions() {
  if (!fs.existsSync(plistPath)) {
    console.log('Info.plist not found. Run "npx cap add ios" first.');
    return;
  }

  let plistContent = fs.readFileSync(plistPath, 'utf8');

  for (const [key, value] of Object.entries(privacyDescriptions)) {
    if (!plistContent.includes(`<key>${key}</key>`)) {
      const insertPoint = plistContent.lastIndexOf('</dict>');
      const newEntry = `\t<key>${key}</key>\n\t<string>${value}</string>\n`;
      plistContent = plistContent.slice(0, insertPoint) + newEntry + plistContent.slice(insertPoint);
      console.log(`Added ${key}`);
    } else {
      console.log(`${key} already exists`);
    }
  }

  fs.writeFileSync(plistPath, plistContent, 'utf8');
  console.log('Info.plist updated successfully');
}

addPrivacyDescriptions();
