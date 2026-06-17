import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Filter, X, Save } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function LeadFilters({
  filters,
  onFilterChange,
  onClearFilters,
  savedViews,
  onSaveView,
  leadStages = [],
  sources = [],
}) {
  const [showFilters, setShowFilters] = React.useState(false);

  const hasActiveFilters = Object.values(filters).some((v) => v && v !== 'all');

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
      <Popover open={showFilters} onOpenChange={setShowFilters}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Filters {hasActiveFilters && '(Active)'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => onFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  {leadStages.length > 0
                    ? leadStages.map((stage) => (
                        <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                      ))
                    : [
                        'new',
                        'contacted',
                        'qualified',
                        'won',
                        'lost',
                      ].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Source</label>
              <Select
                value={filters.source}
                onValueChange={(value) => onFilterChange('source', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  {sources.length > 0
                    ? sources.map((source) => (
                        <SelectItem key={source} value={source}>{source}</SelectItem>
                      ))
                    : ['call', 'email', 'website', 'partner', 'referral'].map((source) => (
                        <SelectItem key={source} value={source}>
                          {source.charAt(0).toUpperCase() + source.slice(1)}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Min Deal Value</label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minValue || ''}
                onChange={(e) => onFilterChange('minValue', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Follow-up Date</label>
              <Input
                type="date"
                value={filters.followUpDate || ''}
                onChange={(e) => onFilterChange('followUpDate', e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={onClearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const name = prompt('Enter view name:');
                  if (name) onSaveView(name);
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save View
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {savedViews && savedViews.length > 0 && (
        <Select
          onValueChange={(value) => {
            const view = savedViews.find((v) => v.name === value);
            if (view) {
              Object.keys(view.filters).forEach((key) => {
                onFilterChange(key, view.filters[key]);
              });
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Saved Views" />
          </SelectTrigger>
          <SelectContent>
            {savedViews.map((view) => (
              <SelectItem key={view.name} value={view.name}>
                {view.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
