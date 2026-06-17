import React from 'react';
import OperationalReportPage from '@/components/pbx/reports/OperationalReportPage';
import { PBX_REPORT_PAGE_BY_ID } from '@shared/pbxReportPages.js';

export function createOperationalReportPage(pageId) {
  const config = PBX_REPORT_PAGE_BY_ID[pageId];
  if (!config) {
    throw new Error(`Unknown PBX report page: ${pageId}`);
  }

  function Page() {
    return <OperationalReportPage config={config} />;
  }
  Page.displayName = config.page;
  return Page;
}
