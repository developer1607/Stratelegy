import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export default function AccountFilters({
  filters,
  onFilterChange,
  industries = [],
  tiers = [],
  owners = [],
  onClear,
}) {
  const tierOptions =
    tiers.length > 0
      ? tiers.map((t) => (t === 'Key' ? 'Key Account' : t))
      : ['Key Account', 'A', 'B', 'C'];

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
          <Label className="text-sm font-semibold mb-2 block">Industry</Label>
          <Select
            value={filters.industry}
            onValueChange={(value) => onFilterChange('industry', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All industries</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-semibold mb-2 block">Revenue range</Label>
          <Select
            value={filters.revenue}
            onValueChange={(value) => onFilterChange('revenue', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All revenue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All revenue</SelectItem>
              <SelectItem value="0-1m">$0 – $1M</SelectItem>
              <SelectItem value="1m-5m">$1M – $5M</SelectItem>
              <SelectItem value="5m+">$5M+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-semibold mb-3 block">Tier</Label>
          <div className="space-y-2">
            {tierOptions.map((tier) => (
              <div key={tier} className="flex items-center space-x-2">
                <Checkbox
                  id={`tier-${tier}`}
                  checked={filters.tiers?.includes(tier)}
                  onCheckedChange={(checked) => {
                    const newTiers = checked
                      ? [...(filters.tiers || []), tier]
                      : (filters.tiers || []).filter((t) => t !== tier);
                    onFilterChange('tiers', newTiers);
                  }}
                />
                <label htmlFor={`tier-${tier}`} className="text-sm cursor-pointer">
                  {tier}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
