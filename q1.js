let svg;
let countries = [];
let years = [];
let minVal = Infinity;
let maxVal = -Infinity;

let margin = {top: 10, right: 30, bottom: 30, left: 120},
    width = 1200 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;


function q1Visualization(rawData) {
    svgConfig();
    extractAxisInfo(rawData);

    let x = d3.scaleBand()
        .range([0, width])
        .domain(years)
        .padding(0.01);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    let y = d3.scaleBand()
        .range([height, 0])
        .domain(countries)
        .padding(0.01);
    svg.append("g")
        .call(d3.axisLeft(y));

    let aggregationNetValue = calculateNetVal(rawData);
    findPolarValues(aggregationNetValue);
    let aggregationList = [];
    for (let countryIndex in aggregationNetValue) {
        let countryData = aggregationNetValue[countryIndex];
        for (let yearIndex in countryData) {
            let balanceVal = countryData[yearIndex];
            let listElem = new Map();
            listElem["country"] = countryIndex;
            listElem["year"] = yearIndex;
            listElem["balance"] = balanceVal;
            aggregationList.push(listElem);
        }
    }

    let colorInterpreter = d3.scaleLinear()
        .range([
            "#2c7bb6",
            "#abd9e9",
            "#ffffcf",
            "#fdae61",
            "#d7191c"
        ])
        .domain([minVal, minVal / 15, 0, maxVal / 15, maxVal]);


    svg.selectAll().data(aggregationList,
        function (d) {
            if (d !== undefined) {
                return d.year + ":" + d.country
            }
        })
        .enter()
        .append("rect")
        .attr("x",
            function (d) {
                return x(d.year)
            })
        .attr("y",
            function (d) {
                return y(d.country)
            })
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", function (d) {
            return colorInterpreter(d.balance)
        })
    renderLegend();

}

function svgConfig() {
    svg = d3.select("#q1")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
}

function extractAxisInfo(rawData) {
    for (let i = 0; i < rawData.length; i++) {
        let current = rawData[i];
        let currentDonor = current.donor;
        let currentReceiver = current.recipient;
        let currentYear = current.year;

        if (!countries.includes(currentDonor)) {
            countries.push(currentDonor);
        }
        if (!countries.includes(currentReceiver)) {
            countries.push(currentReceiver);
        }
        if (!years.includes(currentYear)) {
            years.push(currentYear);
        }

        years.sort();
    }
}

function calculateNetVal(rawData) {
    let processedData = new Map();
    for (let i = 0; i < countries.length; i++) {
        let balanceEachYear = new Map();
        for (let j = 0; j < years.length; j++) {
            balanceEachYear[years[j]] = 0;
        }
        let countryData = balanceEachYear;
        processedData[countries[i]] = countryData;
    }

    for (let i = 0; i < rawData.length; i++) {
        let current = rawData[i];
        let currentDonor = current.donor;
        let currentReceiver = current.recipient;
        let currentYear = current.year;
        let currentMoney = parseInt(current.commitment_amount_usd_constant);

        // donate:
        let prevBalD = processedData[currentDonor][currentYear];
        processedData[currentDonor][currentYear] = prevBalD - currentMoney;

        // receive
        let prevBalR = processedData[currentReceiver][currentYear];
        processedData[currentReceiver][currentYear] = prevBalR + currentMoney;
    }
    return processedData;
}

function findPolarValues(processedData) {
    for (let country in processedData) {
        let countryData = processedData[country];
        for (let year in countryData) {
            let testVal = countryData[year];
            if (testVal < minVal) {
                minVal = testVal;
            }
            if (testVal > maxVal) {
                maxVal = testVal;
            }
        }
    }
}

function renderLegend() {
    let definitionRangeDiff = 1000000;
    // calculate color range
    if(maxVal>0){
        definitionRangeDiff = maxVal - minVal;
    }
    let divergingPoint = (((maxVal) / definitionRangeDiff) * 100);
    let zeroPercentage = divergingPoint.toString() + "%";
    let pinkPercentage = (divergingPoint * 14/ 15).toString() + "%";
    let bluePersentage = (divergingPoint / 15 + 50).toString() + "%";

    let w = 1000, h = 30;
    let key = d3.select("#q1l")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "legend");
    let gradientId = "gradient1";
    let legend = key.append("defs")
        .append("svg:linearGradient")
        .attr("id", gradientId)
        .attr("y1", "100%")
        .attr("x1", "0%")
        .attr("y2", "100%")
        .attr("x2", "100%")
        .attr("spreadMethod", "pad");

    legend.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#d7191c")
        .attr("stop-opacity", 1);
    legend.append("stop")
        .attr("offset", pinkPercentage)
        .attr("stop-color", "#fdae61")
        .attr("stop-opacity", 1);
    legend.append("stop")
        .attr("offset", zeroPercentage)
        .attr("stop-color", "#ffffcf")
        .attr("stop-opacity", 1);
    legend.append("stop")
        .attr("offset", bluePersentage)
        .attr("stop-color", "#abd9e9")
        .attr("stop-opacity", 1);
    legend.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#2c7bb6")
        .attr("stop-opacity", 1);
    key.append("rect")
        .attr("width", w)
        .attr("height", h)
        .style("fill", "url(#gradient1)")
        .attr("transform", "translate(" + margin.left + ",10)");
    let y = d3.scaleLinear()
        .range([w, 0])
        .domain([minVal, maxVal]);
    let yAxis = d3.axisBottom(y);
    key.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margin.left + ",10)")
        .call(yAxis)
}
