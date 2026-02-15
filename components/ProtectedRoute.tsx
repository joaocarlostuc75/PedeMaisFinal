
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useStore();
  const location = useLocation();

  if (!user) {
    // Redireciona para login, salvando a origem para voltar depois
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Usuário logado mas sem permissão: Redireciona para o dashboard apropriado ou home
    if (user.role === 'super_admin') return <Navigate to="/super-admin/dashboard" replace />;
    if (user.role === 'lojista') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'entregador') return <Navigate to="/entregador/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
