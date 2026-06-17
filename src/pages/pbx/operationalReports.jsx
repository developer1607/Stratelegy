import { createOperationalReportPage } from './reportPageFactory';

export const PBXReportOfflineEndpoints = createOperationalReportPage('offlineEndpoints');
export const PBXReportDeviceMonitoring = createOperationalReportPage('deviceMonitoring');
export const PBXReportDomainExport = createOperationalReportPage('domainExport');
export const PBXReportE911 = createOperationalReportPage('e911');
export const PBXReportSIPALG = createOperationalReportPage('sipAlg');
export const PBXReportSIPTrunk = createOperationalReportPage('sipTrunk');
export const PBXReportVulnerabilityCheck = createOperationalReportPage('vulnerabilityCheck');
export const PBXReportVoicemail = createOperationalReportPage('voicemail');
