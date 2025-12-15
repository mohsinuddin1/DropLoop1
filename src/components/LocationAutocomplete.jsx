import { useState, useEffect, useRef } from 'react';
import { MapPin, X, Edit } from 'lucide-react';
import { searchCities } from '../data/indianCities';

export default function LocationAutocomplete({
    value,
    onChange,
    placeholder = "Enter city name",
    label = "Location",
    required = false
}) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [manualCity, setManualCity] = useState('');
    const [manualState, setManualState] = useState('');
    const wrapperRef = useRef(null);

    // Handle click outside to close suggestions
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initialize with existing value
    useEffect(() => {
        if (value?.city) {
            setSelectedLocation(value);
            if (value.isManual) {
                setShowManualEntry(true);
                setManualCity(value.city);
                setManualState(value.state);
                setQuery('Other (Manual Entry)');
            } else {
                setQuery(`${value.city}, ${value.state}`);
            }
        }
    }, [value]);

    const handleInputChange = (e) => {
        const newQuery = e.target.value;
        setQuery(newQuery);

        if (newQuery.length >= 2) {
            const results = searchCities(newQuery);
            setSuggestions(results);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }

        // Clear selection if user modifies input
        if (selectedLocation) {
            setSelectedLocation(null);
            onChange(null);
        }
    };

    const handleSelectLocation = (location) => {
        setSelectedLocation(location);
        setQuery(`${location.city}, ${location.state}`);
        setShowSuggestions(false);
        setShowManualEntry(false);
        onChange({
            city: location.city,
            state: location.state,
            stateCode: location.code,
            isManual: false
        });
    };

    const handleSelectOther = () => {
        setShowSuggestions(false);
        setShowManualEntry(true);
        setQuery('Other (Manual Entry)');
        setSelectedLocation(null);
    };

    const handleManualSubmit = () => {
        if (manualCity.trim() && manualState.trim()) {
            const manualLocation = {
                city: manualCity.trim(),
                state: manualState.trim(),
                stateCode: 'XX',
                isManual: true
            };
            setSelectedLocation(manualLocation);
            onChange(manualLocation);
        }
    };

    const handleClear = () => {
        setQuery('');
        setSelectedLocation(null);
        setSuggestions([]);
        setShowSuggestions(false);
        setShowManualEntry(false);
        setManualCity('');
        setManualState('');
        onChange(null);
    };

    return (
        <div className="space-y-2" ref={wrapperRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {showManualEntry ? (
                            <Edit className="h-5 w-5 text-gray-400" />
                        ) : (
                            <MapPin className="h-5 w-5 text-gray-400" />
                        )}
                    </div>

                    <input
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => query.length >= 2 && !showManualEntry && setShowSuggestions(true)}
                        placeholder={placeholder}
                        className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        autoComplete="off"
                        disabled={showManualEntry}
                    />

                    {query && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </button>
                    )}
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {suggestions.map((location, index) => (
                            <button
                                key={`${location.city}-${location.state}-${index}`}
                                type="button"
                                onClick={() => handleSelectLocation(location)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 transition-colors border-b border-gray-100 last:border-0"
                            >
                                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900">{location.city}</div>
                                    <div className="text-sm text-gray-500">{location.state}</div>
                                </div>
                            </button>
                        ))}

                        {/* "Other" option at the bottom */}
                        <button
                            type="button"
                            onClick={handleSelectOther}
                            className="w-full text-left px-4 py-3 hover:bg-amber-50 flex items-start gap-3 transition-colors border-t-2 border-amber-200 bg-amber-50/50"
                        >
                            <Edit className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-amber-900">Other (Not in list)</div>
                                <div className="text-sm text-amber-600">Enter city and state manually</div>
                            </div>
                        </button>
                    </div>
                )}

                {/* No Results - with "Other" option */}
                {showSuggestions && query.length >= 2 && suggestions.length === 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                        <div className="p-4 text-center text-gray-500 text-sm border-b border-gray-200">
                            No cities found matching "{query}"
                        </div>
                        <button
                            type="button"
                            onClick={handleSelectOther}
                            className="w-full text-left px-4 py-3 hover:bg-amber-50 flex items-start gap-3 transition-colors bg-amber-50/50"
                        >
                            <Edit className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-amber-900">Enter Manually</div>
                                <div className="text-sm text-amber-600">City not in our database? Enter it here</div>
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {/* Manual Entry Form */}
            {showManualEntry && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-sm text-amber-900 font-medium mb-2">
                        <Edit className="h-4 w-4" />
                        <span>Manual Entry</span>
                    </div>

                    <div className="space-y-2">
                        <input
                            type="text"
                            value={manualCity}
                            onChange={(e) => setManualCity(e.target.value)}
                            onBlur={handleManualSubmit}
                            placeholder="City name (e.g., Kargil)"
                            className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-white"
                            required={required}
                        />

                        <input
                            type="text"
                            value={manualState}
                            onChange={(e) => setManualState(e.target.value)}
                            onBlur={handleManualSubmit}
                            placeholder="State name (e.g., Ladakh)"
                            className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-white"
                            required={required}
                        />
                    </div>

                    <p className="text-xs text-amber-700">
                        💡 Enter the city and state name. This will be saved for your post.
                    </p>
                </div>
            )}

            {/* Selected Location Display */}
            {selectedLocation && !showManualEntry && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedLocation.city}</span>
                    <span className="text-gray-400">•</span>
                    <span>{selectedLocation.state}</span>
                </div>
            )}

            {/* Manual Entry Display */}
            {selectedLocation && showManualEntry && manualCity && manualState && (
                <div className="flex items-center gap-2 text-sm text-amber-900 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                    <Edit className="h-4 w-4 text-amber-600" />
                    <span className="font-medium">{manualCity}</span>
                    <span className="text-amber-400">•</span>
                    <span>{manualState}</span>
                    <span className="text-xs text-amber-600 ml-auto">(Manual)</span>
                </div>
            )}
        </div>
    );
}
