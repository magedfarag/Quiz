interface Props {
  requiredPermission: string;
  children: React.ReactNode;
}

export default function PermissionGuard({ requiredPermission, children }: Props) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user.permissions?.[requiredPermission]) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}

// Usage in admin pages:
<PermissionGuard requiredPermission="canManageUsers">
  <AdminUserManagement />
</PermissionGuard>
