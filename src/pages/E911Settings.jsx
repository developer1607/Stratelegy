import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';

export default function E911Settings() {
  return (
    <PbxShell title="E911 Settings" description="Supported E911 countries and states" requiresDomain={false}>
      <SettingsContent />
    </PbxShell>
  );
}

function SettingsContent() {
  const countriesQuery = useQuery({ queryKey: ['pbx-e911-countries'], queryFn: () => pbxApi.e911Countries() });
  const statesQuery = useQuery({ queryKey: ['pbx-e911-states'], queryFn: () => pbxApi.e911States('US') });

  if (countriesQuery.isLoading || statesQuery.isLoading) return <PbxLoading />;
  if (countriesQuery.error) return <PbxError error={countriesQuery.error} />;
  if (statesQuery.error) return <PbxError error={statesQuery.error} />;

  const countryRows = Object.entries(countriesQuery.data || {}).map(([code, name]) => ({ code, name }));
  const stateRows = Object.entries(statesQuery.data || {}).map(([code, name]) => ({ code, name }));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Supported countries</h2>
        <PbxDataTable columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Country' }]} rows={countryRows} />
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">US states / provinces</h2>
        <PbxDataTable columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'State' }]} rows={stateRows} />
      </section>
    </div>
  );
}
