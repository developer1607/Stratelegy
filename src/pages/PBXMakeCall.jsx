import React from 'react';
import PbxShell from '@/components/pbx/PbxShell';
import MakeCallForm from '@/components/pbx/calls/MakeCallForm';
import PermissionGate from '@/components/PermissionGate';

export default function PBXMakeCall() {
  return (
    <PbxShell title="Make Call" description="Place outbound calls" requiresDomain={false}>
      <PermissionGate
        pbxAction="makeCall"
        fallback={
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900 text-sm">
            You have view access but not the <strong>Originate PBX calls</strong> permission. Ask an
            admin to enable it.
          </div>
        }
      >
        <MakeCallForm />
      </PermissionGate>
    </PbxShell>
  );
}
