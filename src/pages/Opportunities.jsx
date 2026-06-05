import React, { useState, useMemo, useEffect } from 'react';
import { api } from '@/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Briefcase, MoreVertical, Download, ArrowUpDown } from 'lucide-react';
import OpportunityDialog from '../components/forms/OpportunityDialog';
import EditOpportunityDialog from '../components/forms/EditOpportunityDialog';
import PermissionGate from '@/components/PermissionGate';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import TablePagination from '@/components/ui/table-pagination';
import { usePaginatedEntityList } from '@/hooks/usePaginatedEntityList';
import { formatCurrency } from '@/utils';
import { usePermissions } from '@/hooks/usePermissions';

const STAGES = [
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
];

const STAGE_COLORS = {
  prospecting: 'bg-gray-100 text-gray-700',
  qualification: 'bg-blue-100 text-blue-700',
  proposal: 'bg-purple-100 text-purple-700',
  negotiation: 'bg-yellow-100 text-yellow-700',
  closed_won: 'bg-green-100 text-green-700',
  closed_lost: 'bg-red-100 text-red-700',
};

export default function Opportunities() {
  const { canWriteEntity } = usePermissions();
  const canManage = canWriteEntity('Opportunity');
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [sortColumn, setSortColumn] = useState('created_date');
  const [sortDirection, setSortDirection] = useState('desc');
  const queryClient = useQueryClient();

  const {
    items: opportunities,
    total: opportunitiesTotal,
    page,
    pageSize,
    setPage,
    resetPage,
    isLoading,
    isFetching,
  } = usePaginatedEntityList('Opportunity', {
    sort: '-created_date',
    queryKeyPrefix: 'opportunities',
  });

  useEffect(() => {
    resetPage();
  }, [searchTerm, stageFilter, sortColumn, sortDirection, resetPage]);

  const createMutation = useMutation({
    mutationFn: (data) => api.entities.Opportunity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      setDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Opportunity.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      setEditDialogOpen(false);
      setSelectedOpportunity(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.Opportunity.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredOpportunities = useMemo(() => {
    let result = opportunities.filter((opp) => {
      const matchSearch =
        opp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.account_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.owner?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStage = stageFilter === 'all' || opp.stage === stageFilter;
      return matchSearch && matchStage;
    });

    result.sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];
      if (sortColumn === 'created_date' || sortColumn === 'close_date') {
        aVal = aVal ? new Date(aVal) : 0;
        bVal = bVal ? new Date(bVal) : 0;
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [opportunities, searchTerm, stageFilter, sortColumn, sortDirection]);

  const kpis = useMemo(() => {
    const open = filteredOpportunities.filter((o) =>
      ['prospecting', 'qualification', 'proposal', 'negotiation'].includes(o.stage)
    );
    const won = filteredOpportunities.filter((o) => o.stage === 'closed_won');
    const pipelineValue = open.reduce((sum, o) => sum + (o.amount || 0), 0);
    const wonValue = won.reduce((sum, o) => sum + (o.amount || 0), 0);
    return {
      total: opportunitiesTotal,
      openCount: open.length,
      pipelineValue,
      wonCount: won.length,
      wonValue,
    };
  }, [filteredOpportunities, opportunitiesTotal]);

  const exportToCSV = () => {
    const headers = ['Name', 'Account', 'Amount', 'Stage', 'Probability', 'Close Date', 'Owner'];
    const rows = filteredOpportunities.map((opp) => [
      opp.name,
      opp.account_name || '',
      opp.amount || 0,
      opp.stage,
      opp.probability || '',
      opp.close_date || '',
      opp.owner || '',
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opportunities_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-primary" />
            Opportunities
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <PermissionGate permission="can_export_data">
            <Button variant="outline" onClick={exportToCSV} className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </PermissionGate>
          <PermissionGate entity="Opportunity">
            <Button
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Opportunity
            </Button>
          </PermissionGate>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500 uppercase">Total</p>
          <p className="text-2xl font-bold">{kpis.total}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500 uppercase">Open deals</p>
          <p className="text-2xl font-bold">{kpis.openCount}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500 uppercase">Pipeline value</p>
          <p className="text-2xl font-bold">{formatCurrency(kpis.pipelineValue, true)}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500 uppercase">Won value</p>
          <p className="text-2xl font-bold">{formatCurrency(kpis.wonValue, true)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {STAGES.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {stage.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                Name <ArrowUpDown className="inline w-3 h-3 ml-1" />
              </TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                Amount <ArrowUpDown className="inline w-3 h-3 ml-1" />
              </TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('close_date')}>
                Close <ArrowUpDown className="inline w-3 h-3 ml-1" />
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || isFetching ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredOpportunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  No opportunities found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOpportunities.map((opp) => (
                <TableRow
                  key={opp.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSelectedOpportunity(opp);
                    setEditDialogOpen(true);
                  }}
                >
                  <TableCell className="font-medium">{opp.name}</TableCell>
                  <TableCell>{opp.account_name || '—'}</TableCell>
                  <TableCell>{formatCurrency(opp.amount || 0, true)}</TableCell>
                  <TableCell>
                    <Badge className={STAGE_COLORS[opp.stage] || 'bg-gray-100 text-gray-700'}>
                      {(opp.stage || 'prospecting').replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{opp.owner || '—'}</TableCell>
                  <TableCell>{opp.close_date || '—'}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOpportunity(opp);
                            setEditDialogOpen(true);
                          }}
                        >
                          {canManage ? 'Edit' : 'View'}
                        </DropdownMenuItem>
                        {canManage && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => deleteMutation.mutate(opp.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        page={page}
        pageSize={pageSize}
        total={opportunitiesTotal}
        onPageChange={setPage}
        className="mt-4"
      />

      <OpportunityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      <EditOpportunityDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        opportunity={selectedOpportunity}
        onSubmit={(data) =>
          selectedOpportunity &&
          updateMutation.mutate({ id: selectedOpportunity.id, data })
        }
        isLoading={updateMutation.isPending}
        readOnly={!canManage}
      />
    </div>
  );
}
