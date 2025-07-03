"use client";
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { GeoJsonObject, Feature, Geometry } from "geojson";
import type { PathOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import { SecurityAlert } from "@/lib/api";

// Theme colors - matching dashboard severity colors
const levelColors: Record<string, string> = {
  critical: '#dc2626', // red-600
  high: '#f97316',     // orange-500
  medium: '#f59e0b',   // yellow-500
  low: '#10b981',      // green-500
  informative: '#3b82f6', // blue-500
};

interface ThreatMapProps {
  alerts: SecurityAlert[];
}

// Country name mapping for API data to GeoJSON features
const countryNameMap: Record<string, string> = {
  'USA': 'United States of America',
  'Russia': 'Russia',
  'France': 'France',
  'Brazil': 'Brazil',
  'China': 'China',
  'India': 'India',
  'UK': 'United Kingdom',
  'Nigeria': 'Nigeria',
  'Japan': 'Japan',
  'Germany': 'Germany',
  'Canada': 'Canada',
  'Australia': 'Australia',
  'South Korea': 'South Korea',
  'Italy': 'Italy',
  'Spain': 'Spain',
  'Mexico': 'Mexico',
  'Indonesia': 'Indonesia',
  'Turkey': 'Turkey',
  'Saudi Arabia': 'Saudi Arabia',
  'Netherlands': 'Netherlands',
  'Switzerland': 'Switzerland',
  'Poland': 'Poland',
  'Argentina': 'Argentina',
  'Belgium': 'Belgium',
  'Sweden': 'Sweden',
  'Austria': 'Austria',
  'Norway': 'Norway',
  'Iran': 'Iran',
  'Thailand': 'Thailand',
  'United Arab Emirates': 'United Arab Emirates',
  'Israel': 'Israel',
  'Singapore': 'Singapore',
  'Malaysia': 'Malaysia',
  'Denmark': 'Denmark',
  'Philippines': 'Philippines',
  'Egypt': 'Egypt',
  'Finland': 'Finland',
  'Chile': 'Chile',
  'Pakistan': 'Pakistan',
  'Ireland': 'Ireland',
  'Colombia': 'Colombia',
  'New Zealand': 'New Zealand',
  'Czech Republic': 'Czech Republic',
  'Greece': 'Greece',
  'Portugal': 'Portugal',
  'Romania': 'Romania',
  'Peru': 'Peru',
  'Iraq': 'Iraq',
  'Ukraine': 'Ukraine',
  'Hungary': 'Hungary',
  'Bangladesh': 'Bangladesh',
  'Vietnam': 'Vietnam',
  'Morocco': 'Morocco',
  'Slovakia': 'Slovakia',
  'Croatia': 'Croatia',
  'Bulgaria': 'Bulgaria',
  'Tunisia': 'Tunisia',
  'Lebanon': 'Lebanon',
  'Jordan': 'Jordan',
  'Serbia': 'Serbia',
  'Lithuania': 'Lithuania',
  'Slovenia': 'Slovenia',
  'Latvia': 'Latvia',
  'Estonia': 'Estonia',
  'Cyprus': 'Cyprus',
  'Luxembourg': 'Luxembourg',
  'Malta': 'Malta',
  'Iceland': 'Iceland',
  'Montenegro': 'Montenegro',
  'Albania': 'Albania',
  'Moldova': 'Moldova',
  'North Macedonia': 'North Macedonia',
  'Bosnia and Herzegovina': 'Bosnia and Herzegovina',
  'Kosovo': 'Kosovo',
  'Vatican City': 'Vatican City',
  'Monaco': 'Monaco',
  'San Marino': 'San Marino',
  'Andorra': 'Andorra',
  'Liechtenstein': 'Liechtenstein'
};

export default function ThreatMap({ alerts }: ThreatMapProps) {
  const geoJsonLayer = useRef<any>(null);
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);

  useEffect(() => {
    fetch("/world-countries.json")
      .then((res) => res.json())
      .then((data) => {
        setGeoData(data);
        // Debug: Log all country names in the GeoJSON file
        if (data && data.features) {
          const geojsonCountryNames = data.features.map((f: any) => f.properties?.ADMIN || f.properties?.NAME || f.properties?.name || f.properties?.COUNTRY || f.properties?.country || f.properties?.ADMIN_0 || f.properties?.NAME_0 || "Unknown Country");
          console.log('GeoJSON country names:', geojsonCountryNames);
          // Specifically log the entry for Russia
          const russiaFeature = data.features.find((f: any) => (f.properties?.ADMIN || f.properties?.NAME || f.properties?.name || f.properties?.COUNTRY || f.properties?.country || f.properties?.ADMIN_0 || f.properties?.NAME_0) && (f.properties?.ADMIN === 'Russia' || f.properties?.NAME === 'Russia' || f.properties?.name === 'Russia'));
          if (russiaFeature) {
            console.log('Russia feature properties:', russiaFeature.properties);
          } else {
            console.log('No Russia feature found in GeoJSON.');
          }
        }
      });
  }, []);

  // Process alerts to get country threat data
  const getCountryThreats = () => {
    const countryCounts: Record<string, { count: number; severity: string; types: Set<string> }> = {};
    alerts.forEach(alert => {
      const country = alert.country;
      if (country) {
        const mappedCountry = countryNameMap[country] || country;
        if (!countryCounts[mappedCountry]) {
          countryCounts[mappedCountry] = { count: 0, severity: 'low', types: new Set() };
        }
        countryCounts[mappedCountry].count++;
        countryCounts[mappedCountry].types.add(alert.type);
        // Determine highest severity for the country
        const severityLevels = ['informative', 'low', 'medium', 'high', 'critical'];
        const currentLevel = severityLevels.indexOf(countryCounts[mappedCountry].severity);
        const alertLevel = severityLevels.indexOf(alert.severity);
        if (alertLevel > currentLevel) {
          countryCounts[mappedCountry].severity = alert.severity;
        }
      }
    });
    // Only log for debugging
    if (alerts.length > 0) {
      console.log('Original countries from API:', alerts.map(a => a.country));
      console.log('Mapped countries:', Object.keys(countryCounts));
      console.log('Country name mapping:', countryNameMap);
    }
    return countryCounts;
  };

  const countryThreats = getCountryThreats();

  const getCountryStyle = (feature: Feature<Geometry, any> | undefined): PathOptions => {
    if (!feature) {
      return {
        fillColor: '#e5e7eb',
        weight: 1,
        opacity: 0.5,
        color: '#d1d5db',
        fillOpacity: 0.3,
      };
    }
    // Try different common property names for country names in GeoJSON
    const countryName = feature.properties?.ADMIN || 
                       feature.properties?.NAME || 
                       feature.properties?.name || 
                       feature.properties?.COUNTRY ||
                       feature.properties?.country ||
                       feature.properties?.ADMIN_0 ||
                       feature.properties?.NAME_0 ||
                       "Unknown Country";
    const threat = countryThreats[countryName];
    // Debug: Log countryName and threat
    if (countryName === 'Russia') {
      console.log('getCountryStyle for Russia:', threat);
    }
    if (threat) {
      return {
        fillColor: levelColors[threat.severity] || '#6b7280',
        weight: 2,
        opacity: 1,
        color: levelColors[threat.severity] || '#6b7280',
        fillOpacity: 0.7,
      };
    }
    return {
      fillColor: '#e5e7eb',
      weight: 1,
      opacity: 0.5,
      color: '#d1d5db',
      fillOpacity: 0.3,
    };
  };

  const onEachFeature = (feature: Feature<Geometry, any>, layer: any) => {
    // Try different common property names for country names in GeoJSON
    const countryName = feature.properties?.ADMIN || 
                       feature.properties?.NAME || 
                       feature.properties?.name || 
                       feature.properties?.COUNTRY ||
                       feature.properties?.country ||
                       feature.properties?.ADMIN_0 ||
                       feature.properties?.NAME_0 ||
                       "Unknown Country";
    
    const threat = countryThreats[countryName];
    
    const countryNameDisplay = countryName || "Unknown Country";

    layer.on({
      mouseover: (e: any) => {
        e.target.setStyle({
          weight: 3,
          color: "#ffffff",
          fillOpacity: 1,
        });
        
        if (threat) {
          const attackTypes = Array.from(threat.types).slice(0, 3);
          layer.bindTooltip(
            `<div style='padding:12px 16px; color:#fff; background:#1a1a1a; border-radius:12px; min-width:200px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); border: 1px solid #333;'>
              <div style='font-weight:700; font-size:16px; margin-bottom:8px; color:#fff;'>${countryNameDisplay}</div>
              <div style='font-size:14px; margin-bottom:6px;'>
                <span style='color:#60a5fa;'>Attacks:</span> <span style='font-weight:600; color:#fff;'>${threat.count}</span>
              </div>
              <div style='font-size:14px; margin-bottom:8px;'>
                <span style='color:#60a5fa;'>Threat Level:</span> 
                <span style='font-weight:600; color:${levelColors[threat.severity]}; text-transform:capitalize; margin-left:4px;'>${threat.severity}</span>
              </div>
              <div style='font-size:13px;'>
                <span style='color:#60a5fa; margin-bottom:4px; display:block;'>Attack Types:</span>
                <div style='display:flex; flex-wrap:wrap; gap:4px;'>
                  ${attackTypes.map((t: string) => `<span style='background:${levelColors[threat.severity]}20; color:${levelColors[threat.severity]}; border-radius:6px; padding:3px 8px; font-size:12px; font-weight:500; border: 1px solid ${levelColors[threat.severity]}40;'>${t}</span>`).join('')}
                </div>
              </div>
            </div>`,
            { direction: "top", sticky: true, className: "custom-tooltip" }
          ).openTooltip();
        } else {
          layer.bindTooltip(
            `<div style='padding:10px 14px; color:#fff; background:#1a1a1a; border-radius:10px; font-size:14px; font-weight:500; border: 1px solid #333; box-shadow: 0 4px 16px rgba(0,0,0,0.2);'>
              ${countryNameDisplay}
            </div>`,
            { direction: "top", sticky: true, className: "custom-tooltip" }
          ).openTooltip();
        }
      },
      mouseout: (e: any) => {
        if (geoJsonLayer.current) {
          geoJsonLayer.current.resetStyle(e.target);
        }
        layer.closeTooltip();
      },
    });
  };

  if (!geoData) {
    return <div className="flex items-center justify-center h-full text-xs text-gray-400">Loading map data...</div>;
  }

  return (
    <div className="w-full h-full">
      <MapContainer
        center={[35, 0]}
        zoom={2}
        maxZoom={6}
        minZoom={2}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <GeoJSON
          ref={geoJsonLayer}
          data={geoData}
          style={getCountryStyle as any}
          onEachFeature={onEachFeature as any}
        />
      </MapContainer>
    </div>
  );
}
