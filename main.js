// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 250};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

// ******************** Graph 1 ********************
const NUM_EXAMPLES = 10;

// Set up SVG object with width, height and margin
let svg1 = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create a linear scale for the x axis
let x = d3.scaleLinear()
    .range([0, graph_1_width - margin.left - margin.right]);

// Create a scale band for the y axis
let y = d3.scaleBand()
    .range([0, graph_1_height - margin.top - margin.bottom])
    .padding(0.1);  // Improves readability

// Set up reference to count SVG group
let countRef = svg1.append("g");
// Set up reference to y axis label to update text in setData
let y_axis_label = svg1.append("g");

// Add x-axis label
let x_axis_text = svg1.append("text")
    .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${(graph_1_height - margin.top - margin.bottom) + 30})`)       // HINT: Place this at the bottom middle edge of the graph
    .style("text-anchor", "middle");

// Add y-axis label
let y_axis_text = svg1.append("text")
    .attr("transform", `translate(-180, ${(graph_1_height - margin.top - margin.bottom) / 2})`)       // HINT: Place this at the center left edge of the graph
    .style("text-anchor", "middle")
    .text("Name");

// Add chart title
let title = svg1.append("text")
    .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${-20})`)       // HINT: Place this at the top middle edge of the graph
    .style("text-anchor", "middle")
    .style("font-size", 15);


function setData(attr_x) {
    let attr_y = "Name"
    
    d3.csv("../data/video_games.csv").then(function(data) {
        // Clean and strip desired amount of data for barplot
        for (i = 0; i < data.length; i++) {
            data[i][attr_x] = parseFloat(data[i][attr_x])
        }
        data = cleanData1(data, (a, b) => b[attr_x] - a[attr_x], NUM_EXAMPLES);

        // Update the x axis domain with the max count of the provided data
        x.domain([0, d3.max(data, function(d) { return d[attr_x]; })]);

        // Update the y axis domains with the desired attribute
        y.domain(data.map(x => x[attr_y]));

        // Render y-axis label
        y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));

        let bars = svg1.selectAll("rect").data(data);

        let color = d3.scaleOrdinal()
        .domain(data.map(function(d) { return d[attr_y] }))
        .range(d3.quantize(d3.interpolateHcl("#8566e2", "#e266de"), NUM_EXAMPLES));

        // Render the bar elements on the DOM
        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("fill", function(d) { return color(d[attr_y]) })
            .attr("x", x(0))
            .attr("y", function(d) { return y(d[attr_y]) })               // HINT: Use function(d) { return ...; } to apply styles based on the data point
            .attr("width", function(d) { return x(d[attr_x]) })
            .attr("height", y.bandwidth());        // HINT: y.bandwidth() makes a reasonable display height

        /*
            In lieu of x-axis labels, we are going to display the count of the artist next to its bar on the
            bar plot. We will be creating these in the same manner as the bars.
         */
        let counts = countRef.selectAll("text").data(data);

        // TODO: Render the text elements on the DOM
        counts.enter()
            .append("text")
            .merge(counts)
            .transition()
            .duration(1000)
            .attr("x", function(d) { return x(d[attr_x]) + 10 })       // HINT: Add a small offset to the right edge of the bar, found by x(d.count)
            .attr("y", function(d) { return y(d[attr_y]) + 15 })       // HINT: Add a small offset to the top edge of the bar, found by y(d.artist)
            .style("text-anchor", "start")
            .text(function(d) { return d[attr_x] });           // HINT: Get the count of the artist

        if (attr_x == "NA_Sales") {
            attr_x_name = "North American Sales"
        } else if (attr_x == "Global_Sales") {
            attr_x_name = "Global Sales"
        }
        title.text("Top 10 Video Games All Time in " + attr_x_name + ".");
        x_axis_text.text(attr_x);

        // Remove elements not in use if fewer groups in new dataset
        bars.exit().remove();
        counts.exit().remove();
    });
}




/**
 * Cleans the provided data using the given comparator then strips to first numExamples
 * instances
 */
function cleanData1(data, comparator, numExamples) {
    // TODO: sort and return the given data with the comparator (extracting the desired number of examples)
    data.sort(comparator)
    return data.slice(0, numExamples)
}

// On page load, render the barplot with the artist data
setData("NA_Sales");






// ******************** Graph 2 ********************
const radius = Math.min(graph_2_width, graph_2_height) - Math.min(margin.top, margin.right, margin.bottom, margin.left)

let svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", radius * 5)
    .attr("height", radius * 4)
    .append("g")
    .attr("transform", `translate(${margin.left + radius}, ${margin.top + (radius * 1.5)})`);

let tooltip = d3.select("#graph2")     // HINT: div id for div containing scatterplot
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.csv("../data/video_games.csv").then(function(data) {
    // Clean and strip desired amount of data for barplot
    for (i = 0; i < data.length; i++) {
        data[i].NA_Sales = parseFloat(data[i].NA_Sales)
        data[i].EU_Sales = parseFloat(data[i].EU_Sales)
        data[i].JP_Sales = parseFloat(data[i].JP_Sales)
        data[i].Other_Sales = parseFloat(data[i].Other_Sales)
        data[i].Global_Sales = parseFloat(data[i].Global_Sales)
    }

    data = cleanData2(data);
    
    let combinedGenreSales = 0;
    for (key in data) {
        combinedGenreSales += data[key][0];
    }

    let color = d3.scaleOrdinal()
        .domain(data)
        .range(["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab","#a7c92c"])

    let pie = d3.pie()
        .value(function(d) { return d.value[0] })
    let data_ready = pie(d3.entries(data))

    let arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius * 0.9)

    let labelArc = d3.arc()
        .innerRadius(radius)
        .outerRadius(radius)

    let mouseover = function(d) {
        let top3Publishers = d.data.value[1];
        let percentage = parseInt((d.data.value[0] / combinedGenreSales) * 1000) / 10;
        
        let color_span = `<span style="color: ${color(d.data.key)};">`;

        let html = `${color_span}Genre: ${d.data.key} ${percentage}%</span><br/>
                1st Publisher: ${top3Publishers[0][0]}, With ${top3Publishers[0][1]} Publishes<br/>
                2nd Publisher: ${top3Publishers[1][0]}, With ${top3Publishers[1][1]} Publishes<br/>
                3rd Publisher: ${top3Publishers[2][0]}, With ${top3Publishers[2][1]} Publishes`;

        // Show the tooltip and set the position relative to the event X and Y location
        tooltip.html(html)
            .style("left", `${(d3.event.pageX)}px`)
            .style("top", `${(d3.event.pageY)}px`)
            .style("background-color", "white")
            .style("box-shadow", `2px 2px 5px ${color(d.data.key)}`)
            .transition()
            .duration(200)
            .style("opacity", 0.9);
    };

    // Mouseout function to hide the tool on exit
    let mouseout = function(d) {
        // Set opacity back to 0 to hide
        tooltip.transition()
            .duration(200)
            .style("opacity", 0);
    };

    svg2.selectAll('allSlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d) { return(color(d.data.key)) })
        .attr("stroke", "white")
        .style("stroke-width", "3px")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    svg2
        .selectAll('allPolylines')
        .data(data_ready)
        .enter()
        .append('polyline')
        .attr("stroke", "black")
        .style("fill", "none")
        .attr("stroke-width", 1)
        .attr('points', function(d) {
            let posA = arc.centroid(d);
            let posB = labelArc.centroid(d);
            let posC = labelArc.centroid(d);
            let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
            return [posA, posB, posC]
        })

    svg2.selectAll('allLabels')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function(d) {
            let percentage = parseInt((d.data.value[0] / combinedGenreSales) * 1000) / 10;
            return d.data.key + " " + percentage + "%"
        })
        .attr('transform', function(d) {
            let pos = labelArc.centroid(d);
            let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
            return 'translate(' + pos + ')'
        })
        .style('text-anchor', function(d) {
            let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            return (midangle < Math.PI ? 'start' : 'end')
        })

    svg2.append("text")
        .attr("transform", `translate(${((radius * 1.5) - margin.left - margin.right) / 2}, ${radius * -1.2})`)       // HINT: Place this at the top middle edge of the graph
        .style("text-anchor", "middle")
        .style("font-size", 20)
        .text("Global Sales Percentage And Top Publishers All Time Per Genre");
});

function cleanData2(data) {
    pieData = {};
    for (i = 0; i < data.length; i++) {
        let genre = data[i].Genre;
        if (genre in pieData) {
            pieData[genre][0] += data[i].Global_Sales;
        } else {
            pieData[genre] = [data[i].Global_Sales, {}];

        }

        let publisher = data[i].Publisher;
        if (publisher in pieData[genre][1]) {
            pieData[genre][1][publisher] += 1;
        } else {
            pieData[genre][1][publisher] = 1;
        }
    }

    for (key1 in pieData) {
        let publisherCounts = [];
        for (key2 in pieData[key1][1]) {
            publisherCounts.push([key2, pieData[key1][1][key2]]);
        }
        publisherCounts = cleanPublisherCounts(publisherCounts, (a, b) => b[1] - a[1], 3);
        pieData[key1][1] = publisherCounts;
    }
    return pieData;
}

function cleanPublisherCounts(data, comparator, numExamples) {
    data.sort(comparator)
    return data.slice(0, numExamples)
}






// ******************** Graph 3 ********************
// Set up SVG object with width, height and margin
let svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)
    .attr("height", graph_3_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create a linear scale for the x axis
let x_v2 = d3.scaleLinear()
    .range([0, graph_3_width - margin.left - margin.right]);

// Create a scale band for the y axis
let y_v2 = d3.scaleBand()
    .range([0, graph_3_height - margin.top - margin.bottom])
    .padding(0.1);  // Improves readability

// Set up reference to count SVG group
let countRef_v2 = svg3.append("g");
// Set up reference to y axis label to update text in setData
let y_axis_label_v2 = svg3.append("g");

// Add x-axis label
let x_axis_text_v2 = svg3.append("text")
    .attr("transform", `translate(${(graph_3_width - margin.left - margin.right) / 2}, ${(graph_3_height - margin.top - margin.bottom) + 30})`)       // HINT: Place this at the bottom middle edge of the graph
    .style("text-anchor", "middle");

// Add y-axis label
let y_axis_text_v2 = svg3.append("text")
    .attr("transform", `translate(-120, ${(graph_3_height - margin.top - margin.bottom) / 2})`)       // HINT: Place this at the center left edge of the graph
    .style("text-anchor", "middle")
    .text("Genre");

// Add chart title
let title_v2 = svg3.append("text")
    .attr("transform", `translate(${(graph_3_width - margin.left - margin.right) / 2}, ${-20})`)       // HINT: Place this at the top middle edge of the graph
    .style("text-anchor", "middle")
    .style("font-size", 15);


function setData3(attr_x) {
    let attr_y = "Genre"
    
    d3.csv("../data/video_games.csv").then(function(data) {
        // Clean and strip desired amount of data for barplot
        data = cleanData3(data, (a, b) => b[attr_x] - a[attr_x], attr_x);

        // Update the x axis domain with the max count of the provided data
        x_v2.domain([0, d3.max(data, function(d) { return d[attr_x]; })]);

        // Update the y axis domains with the desired attribute
        y_v2.domain(data.map(x => x[attr_y]));

        // Render y-axis label
        y_axis_label_v2.call(d3.axisLeft(y_v2).tickSize(0).tickPadding(10));

        let bars = svg3.selectAll("rect").data(data);

        let color = d3.scaleOrdinal()
        .domain(data.map(function(d) { return d[attr_y] }))
        .range(d3.quantize(d3.interpolateHcl("#e26666", "#e2c766"), data.length));

        // Render the bar elements on the DOM
        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("fill", function(d) { return color(d[attr_y]) })
            .attr("x", x_v2(0))
            .attr("y", function(d) { return y_v2(d[attr_y]) })               // HINT: Use function(d) { return ...; } to apply styles based on the data point
            .attr("width", function(d) { return x_v2(d[attr_x]) })
            .attr("height", y_v2.bandwidth());        // HINT: y.bandwidth() makes a reasonable display height

        /*
            In lieu of x-axis labels, we are going to display the count of the artist next to its bar on the
            bar plot. We will be creating these in the same manner as the bars.
        */
        let counts = countRef_v2.selectAll("text").data(data);

        // TODO: Render the text elements on the DOM
        counts.enter()
            .append("text")
            .merge(counts)
            .transition()
            .duration(1000)
            .attr("x", function(d) { return x_v2(d[attr_x]) + 10 })       // HINT: Add a small offset to the right edge of the bar, found by x(d.count)
            .attr("y", function(d) { return y_v2(d[attr_y]) + 15 })       // HINT: Add a small offset to the top edge of the bar, found by y(d.artist)
            .style("text-anchor", "start")
            .text(function(d) { return d[attr_x] });           // HINT: Get the count of the artist

        x_axis_text_v2.text(attr_x);
        title_v2.text("Top Genres All Time in " + attr_x + ".");

        // Remove elements not in use if fewer groups in new dataset
        bars.exit().remove();
        counts.exit().remove();
    });
}



function cleanData3(data, comparator, attr_x) {
    genre_sale_data = {};
    
    for (i = 0; i < data.length; i++) {
        let genre = data[i].Genre;
        let saleValue = parseFloat(data[i][attr_x]);
        if (genre in genre_sale_data) {
            genre_sale_data[genre] += saleValue;
        } else {
            genre_sale_data[genre] = saleValue;
        }
    }

    let newData = [];
    for (key in genre_sale_data) {
        genre_sale_row = {};
        genre_sale_row.Genre = key;
        genre_sale_row[attr_x] = parseFloat(genre_sale_data[key].toFixed(2));
        newData.push(genre_sale_row);
    }

    newData.sort(comparator);
    return newData
}

// On page load, render the barplot with the sales data
setData3("NA_Sales");