import { useState, useEffect, useCallback } from 'react';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  orderCount: number;
  createdAt: string;
  membershipGrade: string;
  profileImage: string | null;
}

interface UserListResponse {
  items: AdminUser[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useUserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (!response.ok) {
        throw new Error('사용자 목록을 불러오는데 실패했습니다');
      }

      const data: UserListResponse = await response.json();
      setUsers(data.items);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleViewUser = (user: AdminUser) => {
    console.log('View user:', user.id);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const formatPhone = (phone: string | null): string => {
    if (!phone) return '-';
    return phone;
  };

  return {
    users,
    totalCount,
    isLoading,
    error,
    searchQuery,
    onSearchChange: handleSearchChange,
    onViewUser: handleViewUser,
    formatDate,
    formatPhone,
  };
}
