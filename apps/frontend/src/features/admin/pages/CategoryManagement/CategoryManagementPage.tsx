import { AdminLayout } from '../../layouts';
import { useCategoryManagement } from './useCategoryManagement';
import { CategoryManagementView } from './CategoryManagementView';
import { CategoryFormModal } from './CategoryFormModal';

export function CategoryManagementPage() {
  const {
    activeTab,
    categories,
    isLoading,
    error,
    editingCategory,
    isFormOpen,
    changeTab,
    createCategory,
    updateCategory,
    deleteCategory,
    openCreateForm,
    openEditForm,
    closeForm,
  } = useCategoryManagement();

  const handleSubmit = async (formData: { name: string; sortOrder: number; isActive?: boolean }) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, formData);
    } else {
      await createCategory(formData);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteCategory(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다');
    }
  };

  return (
    <AdminLayout title="카테고리 관리" description="상품 카테고리를 관리합니다">
      <CategoryManagementView
        activeTab={activeTab}
        categories={categories}
        isLoading={isLoading}
        error={error}
        onChangeTab={changeTab}
        onAdd={openCreateForm}
        onEdit={openEditForm}
        onDelete={handleDelete}
      />
      <CategoryFormModal
        isOpen={isFormOpen}
        activeTab={activeTab}
        editingCategory={editingCategory}
        onSubmit={handleSubmit}
        onClose={closeForm}
      />
    </AdminLayout>
  );
}
