import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {useLanguage} from '../../contexts/langContext'
function DistributionPlot({ data }) {
    const { language } = useLanguage();

    const d3Container = useRef(null);
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    useEffect(() => {
        if (data && d3Container.current) {
            d3.select(d3Container.current).selectAll("*").remove();
            const svg = d3.select(d3Container.current)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // Process data
            // Find the 'ages' and 'sample_mean_age' objects in the data
            const agesData = data.find(item => item.key === 'ages');
            const meanAgeData = data.find(item => item.key === 'sample_mean_age');
            // console.log('meanAgeData.value', meanAgeData.value)
            // Parse ages and mean age from the data
            // const ages = agesData ? JSON.parse(agesData.value) : [];
            const ages = agesData ? agesData.value.split(',').map(Number) : [];
            const meanAge = meanAgeData ? parseFloat(meanAgeData.value) : 0;


            // Create the X scale
            const x = d3.scaleLinear()
                .domain([0, d3.max(ages)])
                .range([0, width]);

            // Set up a histogram generator
            const histogram = d3.histogram()
                .value(d => d)
                .domain(x.domain())
                .thresholds(x.ticks(40)); // adjust the number of bins

            const bins = histogram(ages);

            // Y scale
            const y = d3.scaleLinear()
                .domain([0, d3.max(bins, d => d.length)])
                .range([height, 0]);
            // const y = d3.scaleLinear()
            //     .domain([0, 1])
            //     .range([height / 2, height / 2]);

            // Draw bars
            svg.selectAll("rect")
                .data(bins)
                .enter().append("rect")
                .attr("x", d => x(d.x0) + 1)
                .attr("y", d => y(d.length))
                .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
                .attr("height", d => height - y(d.length))
                .attr("fill", "#69b3a2");
            // Draw circles for each age
            svg.selectAll("circle")
                .data(ages)
                .enter().append("circle")
                .attr("cx", d => x(d))
                .attr("cy", () => y(0)) // constant y value
                .attr("r", 3) // radius of the circles
                .attr("fill", "#69b3a2");

            // Draw axis
            svg.append("g")
                .call(d3.axisLeft(y));
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x));
            //     svg.append("g")
            //     .call(d3.axisLeft(y).ticks(0)); // No tick for y-axis
            // svg.append("g")
            //     .attr("transform", `translate(0,${height / 2})`)
            //     .call(d3.axisBottom(x));

            // Draw mean line
            svg.append("line")
                .attr("x1", x(meanAge))
                .attr("x2", x(meanAge))
                .attr("y1", 0)
                .attr("y2", height)
                .attr("stroke", "red")
                .attr("stroke-width", 2);

            svg.append("text")
                .attr("x", x(meanAge) + 5) // Position text slightly right of the line
                .attr("y", 20) // Position text near the top of the plot
                .text(language === 'ru' ? `Средний возраст: ${meanAge}` : `Mean Age: ${meanAge}`)
                .attr("fill", "red")
                .attr("font-size", "12px");

                // Draw X-axis label
            svg.append("text")
            .attr("x", width / 2) // Position at the center of the axis
            .attr("y", height + margin.bottom -10) // Position below the bottom axis
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text(language === 'ru' ? `Возраст` : `Age`);

            // Draw Y-axis label
            svg.append("text")
                .attr("transform", "rotate(-90)") // Rotate the text for the Y-axis
                .attr("y", -margin.left) // Position to the left of the Y-axis
                .attr("x", -(height / 2)) // Position at the center of the axis
                .attr("dy", "1em") // Nudge the text to align nicely
                .style("text-anchor", "middle")
                .style("font-size", "12px")
                .text(language === 'ru' ? `Количество` : `Count`);
        }
    }, [data,language]);

    return (
        <svg
            className="d3-component"
            ref={d3Container}
            style={{ margin: '0 auto', display: 'block' }}
        />
    );
}

export default DistributionPlot;
