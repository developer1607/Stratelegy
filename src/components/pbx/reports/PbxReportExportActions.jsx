import React, { useState } from "react";
import { FileDown, Play } from "lucide-react";
import PermissionGate from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import QueueReportDialog from "@/components/pbx/reports/QueueReportDialog";

/**
 * Header actions: generate async SkySwitch export (CSV/ZIP download when ready).
 */
export default function PbxReportExportActions({ reportTypes }) {
  const [queueType, setQueueType] = useState(null);
  const [queueOpen, setQueueOpen] = useState(false);

  if (!reportTypes?.length) return null;

  const openQueue = (type) => {
    setQueueType(type);
    setQueueOpen(true);
  };

  return (
    <PermissionGate pbxAction="manageReports">
      {reportTypes.length === 1 ? (
        <Button onClick={() => openQueue(reportTypes[0])}>
          <FileDown className="h-4 w-4 mr-1.5" />
          Generate export
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <FileDown className="h-4 w-4 mr-1.5" />
              Generate export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            {reportTypes.map((type) => (
              <DropdownMenuItem
                key={type.value}
                onClick={() => openQueue(type)}
              >
                <Play className="h-3.5 w-3.5 mr-2 shrink-0" />
                <span className="truncate">{type.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <QueueReportDialog
        open={queueOpen}
        onOpenChange={setQueueOpen}
        reportType={queueType}
      />
    </PermissionGate>
  );
}
