import React, { useRef, useState, useEffect } from "react";
import * as d3 from "d3";
import styles from "./bar-plot.module.css";

export function BarPlot({ data, language, onBarClick = () => {} }) {
  const [tooltipContent, setTooltipContent] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);
  const [selectedBar, setSelectedBar] = useState(null);

  const handleBarClick = (name) => {
    setSelectedBar(name); 
    onBarClick(name);
  };

  // Setup barplot
  const width = 400;
  const height = 200;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const colorScale = d3.scaleOrdinal(d3.schemeAccent);

  const xScale = d3.scaleBand().domain(data.map(d => d.name)).range([0, width]).padding(0.1);
  const yScale = d3.scaleLinear().domain([0, d3.max(data, d => d.value)]).nice().range([height, 0]);

  const ref = useRef(null);

  const xAxisLabel = language === 'en' ? "Subcategories" : "Подкатегории";
  const yAxisLabel = language === 'en' ? "%" : "%";

  const handleMouseEnter = (d, event) => {
    setTooltipContent(`${d.value}%`);
    setShowTooltip(true);
  };


  useEffect(() => {
    if (!tooltipRef.current) return;
  }, [tooltipRef]);

  const setTooltipPosition = (x, y) => {
    if (!tooltipRef.current) return;
    let newX = x - tooltipRef.current.offsetWidth / 2;
    newX = Math.max(newX, 0);
    tooltipRef.current.style.transform = `translate(${newX}px, ${y + 12}px)`;
  };


  const handleMouseLeave = () => {
    setShowTooltip(false);
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = 0;
    }
  };

  // Create bars based on data
  const bars = data.map((d, i) => {
    const isSelected = d.name === selectedBar;
    return (
      <g
        key={i}
        className={styles.bar}
        onClick={() => handleBarClick(d.name)}
        onMouseEnter={(event) => handleMouseEnter(d, event)}
        onMouseLeave={handleMouseLeave}
       
      >
        <rect
          x={xScale(d.name)}
          y={yScale(d.value)}
          width={xScale.bandwidth()}
          height={height - yScale(d.value)}
          fill={colorScale(d.value)}
          stroke={isSelected ? "#969aff" : "none"} 
          strokeWidth={isSelected ? "2px" : "0"}
        />
      </g>
    );
  });

  // Create legend
  const legend = data.map((d, i) => { 
    return ( 
      <div className={styles.legendText} key={i}> 
        <div 
          style={{ 
            background: colorScale(d.value), 
            width: 10, 
            height: 10, 
            borderRadius: 10, 
            minWidth: 10, 
            boxShadow: '-2px 3px 5px 0px rgba(0, 0, 0, 0.1)', 
            fontSize: 10,  
          }} 
        ></div> 
        {d.name} 
      </div> 
    ); 
  });

  return (
    <div className={styles.barChart}
    onPointerMove={(ev) => {
      setTooltipPosition(ev.clientX, ev.clientY);
    }}
    >
      <svg width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {bars}
          <g transform={`translate(0,${height})`} />
          <g ref={(node) => d3.select(node).call(d3.axisLeft(yScale))} />
          <text transform={`translate(${width / 2}, ${height + margin.bottom - 5})`} textAnchor="middle">
            {xAxisLabel}
          </text>
          <text transform={`rotate(-90)`} x={-height / 2} y={-margin.left + 15} textAnchor="middle">
            {yAxisLabel}
          </text>
        </g>
      </svg>
      <p onClick={() => handleBarClick("All")} className="show-all-button">
      {language === 'en' ? 'Select all subcategories ' : 'Выбрать все подкатегории'}
      </p>
      {showTooltip && (
        <div className={`pie-tooltip ${showTooltip ? "" : "hidden"}`} ref={tooltipRef}>
          <h1>{tooltipContent}</h1>
        </div>
      )}
      <div className={styles.legendContainer}>{legend}</div>
      
    </div>
  );
}
