
  const total = 343217;

function drawDeathChart() {
  const data = [
    { cause: "Pneumonia & Influenza", deaths: 40362/total, infectious: true },
    { cause: "Tuberculosis", deaths: 38820/total, infectious: true },
    { cause: "Diarrhea & Enteritis", deaths: 28491/total, infectious: true },
    { cause: "Heart disease", deaths: 27427/total, infectious: false },
    { cause: "Brain tissue damage", deaths: 21353/total, infectious: false },
    { cause: "Kidney desease", deaths: 17699/total, infectious: false },
    { cause: "Accidents", deaths: 14429/total, infectious: false },
    { cause: "Cancer", deaths: 12769/total, infectious: false },
    { cause: "Senility", deaths: 10015/total, infectious: false },
    { cause: "Diphtheria", deaths: 8056/total, infectious: true }
  ];



  const container = d3.select("#disease-graph");
const containerWidth = container.node().getBoundingClientRect().width;
const containerHeight = window.innerHeight; // 👈 define this first
 const isMobile = window.innerWidth < 768;

const margin = {
  top: containerHeight * 0.03,     // 3% of viewport height
  right: containerWidth * 0.05,    // 5% of width
  bottom: containerHeight * 0.07,  // 7% of viewport height
  left: isMobile ? containerWidth * 0.4 : containerWidth * 0.2  // 20% of width on desktop and 30% on mobile
};

const widthFactor = isMobile ? 0.95 : 0.6;
const width = containerWidth * widthFactor - margin.left - margin.right;

const height = window.innerHeight * 0.4; // 40% of viewport height



  d3.select("#disease-graph svg").remove();

  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear()
  .domain([0, 15]) // 0–15%
  .range([0, width]);


  const y = d3.scaleBand()
    .domain(data.map(d => d.cause))
    .range([0, height])
    .padding(0.2);

  // x axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(3).tickFormat(d => d + "%"))
    .selectAll("text")
    .style("fill", "white")
    .style("font-family", "Merriweather, serif")
    .style("font-size", "clamp(9px, 0.8vw, 0.75rem)")
    .style("font-weight", 300);

  // y axis
  svg.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("fill", "white")
    .style("font-family", "Merriweather, serif")
    .style("font-size", "clamp(9px, 0.8vw, 0.75rem)")
    .style("font-weight", 500);

  // bars
  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("y", d => y(d.cause))
    .attr("x", 0)
    .attr("height", y.bandwidth())
    .attr("width", 0)
    .attr("fill", d => d.infectious ? "rgb(30, 230, 120)" : "white")
    .transition()
    .duration(1600)
    .attr("width", d => x((d.deaths) * 100));


  // values at end of bars
  svg.selectAll("text.value")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "value")
    .attr("x", d => x(d.deaths * 100) + 5)
    .attr("y", d => y(d.cause) + y.bandwidth() / 2 + 4)
    .text(d => Math.round(d.deaths * 100) + "%") // % format
    .style("fill", "white")
    .style("font-family", "Merriweather, serif")
    .style("font-size", "clamp(9px, 0.8vw, 0.75rem)")
    .style("font-weight", 500);


 // add title below
  svg.append("text")
  .attr("x", 0) // left aligned
  .attr("y", height + margin.bottom -4) // just below chart
  .text("Share of deaths by disease, USA, 1900")
  .style("fill", "white")
  .style("font-size", "clamp(10px, 0.8vw, 0.75rem)")
  .style("font-family", "Merriweather, serif")   // <-- custom font
  .style("font-weight", 300)
  .style("font-style", "italic")
  .attr("text-anchor", "start");
}

window.drawDeathChart = drawDeathChart;


function drawDeathChart2019() {
  const data = [
    { cause: "Heart disease", value: 33.1, infectious: false },
    { cause: "Cancer", value: 16.8, infectious: false },
    { cause: "Chronic lung diseases", value: 7.5, infectious: false },
    { cause: "Chest infections and tuberculosis", value: 6.6, infectious: true },
    { cause: "Diabetes and kidney diseases", value: 5.4, infectious: false },
    { cause: "Digestive diseases", value: 4.4, infectious: false },
    { cause: "Neurological disorders", value: 4.3, infectious: false },
    { cause: "Pregnancy and newborn disorders", value: 3.8, infectious: false },
    { cause: "Accidential injuries", value: 3.2, infectious: false },
    { cause: "Gut infections", value: 2.5, infectious: true }
  ];

  const container = d3.select("#deathGraph2019");
  const containerWidth = container.node().getBoundingClientRect().width;
const containerHeight = window.innerHeight; // 👈 define this first
 const isMobile = window.innerWidth < 900;

const margin = {
  top: containerHeight * 0.03,     // 3% of viewport height
  right: containerWidth * 0.1,    // 5% of width
  bottom: containerHeight * 0.07,  // 7% of viewport height
  left: isMobile ? containerWidth * 0.3 : containerWidth * 0.2  // 20% of width on desktop and 30% on mobile
};

 
const widthFactor = isMobile ? 0.95 : 0.6;
const width = containerWidth * widthFactor - margin.left - margin.right; // same as 1900 chart
  const height = window.innerHeight*0.4;  // same as 1900 chart

  container.html(""); // clear old chart

  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.cause))
    .range([0, height])
    .padding(0.2);

  // axes
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "%"))
    .selectAll("text")
    .style("fill", "white")
    .style("font-family", "Merriweather, serif")
    .style("font-size", "clamp(10px, 0.8vw, 0.75rem)") 
    .style("font-weight", 300);

  svg.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("fill", "white")
    .style("font-family", "Merriweather, serif")
    .style("font-size", "clamp(9px, 0.8vw, 0.75rem)")
    .style("font-weight", 500);

  // bars
  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("y", d => y(d.cause))
    .attr("x", 0)
    .attr("height", y.bandwidth())
    .attr("width", 0)
    .attr("fill", d => d.infectious ? "rgb(30, 230, 120)" : "white")
    .transition()
    .duration(1600)
    .attr("width", d => x(d.value));

  // values at end of bars
  svg.selectAll("text.value")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "value")
    .attr("x", d => x(d.value) + 5)
    .attr("y", d => y(d.cause) + y.bandwidth()/2 + 4)
    .text(d => d.value + "%")
    .style("fill", "white")
    .style("font-family", "Merriweather, serif")
    .style("font-size", "clamp(9px, 0.8vw, 0.75rem)")
    .style("font-weight", 500);

  // chart title
  svg.append("text")
    .attr("x", 0)
    .attr("y", height + margin.bottom-4)
    .text("Share of deaths by disease, worldwide, 2019")
    .style("fill", "white")
  .style("font-size", "clamp(10px, 0.8vw, 0.75rem)")
  .style("font-family", "Merriweather, serif")   // <-- custom font
  .style("font-weight", 300)
  .style("font-style", "italic");
}
