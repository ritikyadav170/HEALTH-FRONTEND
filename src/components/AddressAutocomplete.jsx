import React from 'react';
import { usePlacesWidget } from 'react-google-autocomplete';

const AddressAutocomplete = ({ value, onChange, onPlaceSelected, placeholder, className }) => {
  const { ref } = usePlacesWidget({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    onPlaceSelected: (place) => {
      if (onPlaceSelected) onPlaceSelected(place);
    },
    options: {
      types: ['geocode', 'establishment'],
      fields: ['address_components', 'formatted_address', 'geometry', 'name'],
    },
  });

  return (
    <input
      ref={ref}
      type="text"
      placeholder={placeholder || "Search address..."}
      value={value}
      onChange={onChange}
      name="address"
      className={className || "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"}
    />
  );
};

export default AddressAutocomplete;
