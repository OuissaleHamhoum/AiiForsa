'use client';

import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import React, { useMemo, useState } from 'react';

// Import JSON data directly
import statesData from '@/data/states.json';

interface StateCity {
    name: string;
    country_name: string;
}

interface LocationInputProps {
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
}

const LocationInput = React.forwardRef<HTMLDivElement, LocationInputProps>(
    ({ value, onChange, disabled }, ref) => {
        const [selectedCountry, setSelectedCountry] = useState<string>('');
        const [selectedCity, setSelectedCity] = useState<string>('');
        const [openCountryDropdown, setOpenCountryDropdown] = useState(false);
        const [openCityDropdown, setOpenCityDropdown] = useState(false);

        // Cast imported JSON data
        const allStates = statesData as StateCity[];

        // Extract unique countries from states data
        const countries = useMemo(() => {
            const uniqueCountries = Array.from(
                new Set(allStates.map(state => state.country_name)),
            ).sort();
            return uniqueCountries;
        }, [allStates]);

        // Filter cities/states for selected country
        const availableCities = useMemo(() => {
            if (!selectedCountry) return [];
            return allStates
                .filter(state => state.country_name === selectedCountry)
                .sort((a, b) => a.name.localeCompare(b.name));
        }, [selectedCountry, allStates]);

        // Effect to parse initial value
        React.useEffect(() => {
            if (value && !selectedCountry) {
                const parts = value.split(', ');
                if (parts.length >= 2) {
                    const city = parts[0];
                    const country = parts[1];
                    setSelectedCity(city);
                    setSelectedCountry(country);
                } else if (parts.length === 1) {
                    // Only country selected
                    setSelectedCountry(parts[0]);
                }
            }
        }, [value, selectedCountry]);

        const handleCountrySelect = (country: string) => {
            setSelectedCountry(country);
            setSelectedCity(''); // Reset city when country changes
            setOpenCountryDropdown(false);
            // Just return country name for now
            onChange?.(country);
        };

        const handleCitySelect = (city: StateCity) => {
            setSelectedCity(city.name);
            const location = `${city.name}, ${selectedCountry}`;
            onChange?.(location);
            setOpenCityDropdown(false);
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'flex gap-3',
                    selectedCountry && availableCities.length > 0
                        ? 'grid grid-cols-2'
                        : 'flex',
                )}
            >
                {/* Country Selector */}
                <Popover
                    open={openCountryDropdown}
                    onOpenChange={setOpenCountryDropdown}
                >
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCountryDropdown}
                            disabled={disabled}
                            className="w-full justify-between border-border bg-transparent text-foreground hover:bg-transparent"
                        >
                            {selectedCountry ? (
                                <span>{selectedCountry}</span>
                            ) : (
                                <span className="text-muted-foreground">
                                    Select Country...
                                </span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                        <Command>
                            <CommandInput placeholder="Search country..." />
                            <CommandList>
                                <CommandEmpty>No country found.</CommandEmpty>
                                <CommandGroup>
                                    <ScrollArea className="h-[300px]">
                                        {countries.map(country => (
                                            <CommandItem
                                                key={country}
                                                value={country}
                                                onSelect={() =>
                                                    handleCountrySelect(country)
                                                }
                                                className="flex cursor-pointer items-center justify-between text-sm"
                                            >
                                                <span>{country}</span>
                                                <Check
                                                    className={cn(
                                                        'h-4 w-4',
                                                        selectedCountry ===
                                                            country
                                                            ? 'opacity-100'
                                                            : 'opacity-0',
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                        <ScrollBar orientation="vertical" />
                                    </ScrollArea>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {/* City/State Selector - Only shown if selected country has cities */}
                {availableCities.length > 0 && (
                    <Popover
                        open={openCityDropdown}
                        onOpenChange={setOpenCityDropdown}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openCityDropdown}
                                disabled={!selectedCountry}
                                className="w-full justify-between border-border bg-transparent text-foreground hover:bg-transparent"
                            >
                                {selectedCity ? (
                                    <span>{selectedCity}</span>
                                ) : (
                                    <span className="text-muted-foreground">
                                        Select City...
                                    </span>
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Search city..." />
                                <CommandList>
                                    <CommandEmpty>No city found.</CommandEmpty>
                                    <CommandGroup>
                                        <ScrollArea className="h-[300px]">
                                            {availableCities.map(city => (
                                                <CommandItem
                                                    key={`${city.name}-${city.country_name}`}
                                                    value={city.name}
                                                    onSelect={() =>
                                                        handleCitySelect(city)
                                                    }
                                                    className="flex cursor-pointer items-center justify-between text-sm"
                                                >
                                                    <span>{city.name}</span>
                                                    <Check
                                                        className={cn(
                                                            'h-4 w-4',
                                                            selectedCity ===
                                                                city.name
                                                                ? 'opacity-100'
                                                                : 'opacity-0',
                                                        )}
                                                    />
                                                </CommandItem>
                                            ))}
                                            <ScrollBar orientation="vertical" />
                                        </ScrollArea>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
        );
    },
);

LocationInput.displayName = 'LocationInput';

export { LocationInput };
