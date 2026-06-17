import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { usePermissions } from "@/hooks/usePermissions";
import AccessDenied from "@/components/AccessDenied";

export default function RouteGuard({ pageName, children }) {
  const navigate = useNavigate();
  const { isLoading, canAccessPage, defaultHomePage } = usePermissions();

  const allowed = canAccessPage(pageName);

  useEffect(() => {
    if (isLoading || allowed) return;
    if (defaultHomePage && defaultHomePage !== pageName) {
      navigate(createPageUrl(defaultHomePage), { replace: true });
    }
  }, [isLoading, allowed, defaultHomePage, pageName, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!allowed) {
    if (defaultHomePage && defaultHomePage !== pageName) {
      return (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      );
    }
    return <AccessDenied />;
  }

  return children;
}
