import { AdminLayout } from '../../layouts';
import { useSettings } from './useSettings';
import { SettingsView } from './SettingsView';

export function SettingsPage() {
  const {
    cacheStatus,
    isLoading,
    isClearingCache,
    clearCache,
    snackbar,
    closeSnackbar,
  } = useSettings();

  return (
    <AdminLayout
      title="설정"
      description="사이트 설정을 관리합니다"
    >
      <SettingsView
        cacheStatus={cacheStatus}
        isLoading={isLoading}
        isClearingCache={isClearingCache}
        onClearCache={clearCache}
        snackbar={snackbar}
        onCloseSnackbar={closeSnackbar}
      />
    </AdminLayout>
  );
}
