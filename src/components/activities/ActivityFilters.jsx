import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotateCcw } from 'lucide-react';

export default function ActivityFilters({
  filters,
  onFilterChange,
  activityTypes = [],
  owners = [],
  onClear,
}) {
  const types =
    activityTypes.length > 0
      ? activityTypes
      : ['Call', 'Email', 'Meeting', 'WhatsApp', 'Note'];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center gap-2">
          <CardTitle className="text-base">Filters</CardTitle>
          {onClear && (
            <Button variant="ghost" size="sm" onClick={onClear} className="h-8">
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-semibold mb-3 block">Activity type</Label>
          <div className="space-y-2">
            {types.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`activity-type-${type}`}
                  checked={filters.types?.includes(type)}
                  onCheckedChange={(checked) => {
                    const newTypes = checked
                      ? [...(filters.types || []), type]
                      : (filters.types || []).filter((t) => t !== type);
                    onFilterChange('types', newTypes);
                  }}
                />
                <label htmlFor={`activity-type-${type}`} className="text-sm cursor-pointer">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold mb-2 block">Owner</Label>
          <Select value={filters.owner} onValueChange={(value) => onFilterChange('owner', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All owners" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All owners</SelectItem>
              {owners.map((owner) => (
                <SelectItem key={owner} value={owner}>{owner}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-semibold mb-2 block">Date range</Label>
          <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All dates</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
