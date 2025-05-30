import React, { useRef, useMemo, useEffect,useState } from "react";
import * as d3 from "d3";
import * as d3geo from "d3-geo";
import geoData from "./../../assets/geodata/mapData.json";
import '../../App.css';
import { useLanguage } from "../../contexts/langContext";
import { getTranslations } from "../../services/googleSheetsService";

function Map({
  statistics,
  style = {},
  colorsForScale = ["#F4F3EE", "#969AFF", "#000"]
}) {
  // Check if mapData is being passed correctly as statistics
  useEffect(() => {}, [statistics]);

  console.log('geoData',geoData)
  // Map
  const [regionDescription, setRegionDescription] = useState("");
  const [regionValue, setRegionValue] = useState("");

  const { language } = useLanguage();
  const [translations, setTranslations] = useState([]);

  useEffect(() => {
    getTranslations()
      .then((data) => {
        setTranslations(data);
      })
      .catch((err) => {})
      .finally(() => {});
  }, []);

  const projection = d3geo
    .geoConicConformal()
    .scale(300)
    .center([54, 44])
    .rotate([-110, 0]);

  console.log('projection',projection)  
  const path = d3geo.geoPath().projection(projection);
  console.log('path',path)
  const values = statistics.map((item) => item.value);
  
  // const min = Math.min(...values);
  // const max = Math.max(...values);
  const min = Math.min(0);
  const max = Math.max(100);

  const getScale = () => {
    return [min, (min + max) / 2, max];
  };

  var colorScale = d3.scaleLinear(getScale(), colorsForScale);

  const mapElements = useMemo(() => {
   

    if (statistics.length > 0) {
      console.log('geoData.features',geoData.features)
      return geoData.features.map((d, index) => {


        console.log('d.coordinates[0]',d.geometry.coordinates[0])

       // Reverse the coordinates of each polygon
      //  if (d.name=== "Приволжский федеральный округ"){
      //     d.geometry.coordinates[0].forEach(polygon => {
              
      //           console.log('polygon',polygon)
      //             polygon.reverse();
      //             console.log('polygon.reverse()',polygon)
      //         });
       
      //       }

        const pathD = path(d);
        // console.log('Feature path for', d.properties.name, ':', pathD);
        if (!pathD) return null; // Skip if path is not defined

        const relevantStatistics = statistics.filter(
          (item) => item.name === d.properties.name
        )[0];
        const color = relevantStatistics
          ? colorScale(relevantStatistics?.value)
          : "lightgrey";
        return (
          <path
            key={"map-element-" + d.properties.name}
            name={d.properties.name}
            d={path(d)}
            fill= {color}
            stroke="#FFFFFF"
            strokeWidth="0.5"
            strokeOpacity="0.5"
            opacity="0.85"
            onMouseEnter={(e) => {
              d3.select(e.target).attr("opacity", 1);
            
              // Check the language and set the region description accordingly
              if (language === "ru") {
                setRegionDescription(relevantStatistics.name);
              } else {
                // Find the English equivalent in translations
                const translation = translations.find(
                  (t) => t.name_ru === relevantStatistics.name
                );
                setRegionDescription(
                  translation ? translation.name_en : relevantStatistics.name
                );
              }
              setRegionValue(Math.round(relevantStatistics.value));
            }}
            onMouseOut={(e) => {
              d3.select(e.target).attr("opacity", 0.85);
              setRegionDescription("");
              setRegionValue("");
            }}
          />
        );
      });
    } else {
      return (
        <>
          <p>No map data.</p>
        </>
      );
    }
  }, [geoData, statistics]);

  // Legend
  const mapTooltip = useRef(null);

  useEffect(() => {
    if (!mapTooltip.current) return;
  }, [mapTooltip]);

  const setTooltipPosition = (x, y) => {
    if (!mapTooltip.current) return;
    let newX = x - mapTooltip.current.offsetWidth / 2;
    newX = Math.max(newX, 0);
    mapTooltip.current.style.transform = `translate(${newX}px, ${y + 12}px)`;
  };

  if (statistics) {
    return (
      <div
        onPointerMove={(ev) => {
          setTooltipPosition(ev.clientX, ev.clientY);
        }}
        style={{ position: "relative", display: "inline-block", ...style }}
      >
        <svg className="map">
          <g className="map">{mapElements}</g>
        </svg>

        <div
          className={`map-tooltip ${!regionDescription && "hidden"}`}
          ref={mapTooltip}
        >
          {/* <div className="tip"></div> */}
          {regionDescription && (
            <>
              <h3>{regionDescription}</h3>
              <h1>{regionValue}%</h1>
            </>
          )}
        </div>
      </div>
    );
  }
  return <></>;
}

export default Map;
