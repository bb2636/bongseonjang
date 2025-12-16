import { AdminLayout } from '../../layouts';
import { useUserManagement } from './useUserManagement';
import { UserManagementView } from './UserManagementView';

export function UserManagementPage() {
  const {
    users,
    totalCount,
    isLoading,
    error,
    searchQuery,
    onSearchChange,
    onViewUser,
    formatDate,
    formatPhone,
  } = useUserManagement();

  return (
    <AdminLayout
      title="사용자 관리"
      description="가입된 사용자의 정보와 현황을 관리합니다"
    >
      <UserManagementView
        users={users}
        totalCount={totalCount}
        isLoading={isLoading}
        error={error}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onViewUser={onViewUser}
        formatDate={formatDate}
        formatPhone={formatPhone}
      />
    </AdminLayout>
  );
}
