let svg2;
let purposeNames = [];
let purposeCodes = [];
let purposeAggregateData = [];
let minVal2 = Infinity;
let maxVal2 = -Infinity;
let margin2 = {top: 10, right: 30, bottom: 30, left: 210};
let height2 = 200 - margin2.top - margin2.bottom;

function q2Visualization() {
    svg2 = d3.select("#q2")
        .attr("width", width + margin2.left + margin2.right)
        .attr("height", height2 + margin2.top + margin2.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin2.left + "," + margin2.top + ")");

    // get top 10 purposes info
    recordTop10Names(rawData);
    // render axis
    // years is the same as in first chart
    let x = d3.scaleBand()
        .range([0, width])
        .domain(years)
        .padding(0.01);
    svg2.append("g")
        .attr("transform", "translate(0," + height2 + ")")
        .call(d3.axisBottom(x));

    let y = d3.scaleBand()
        .range([height2, 0])
        .domain(purposeNames)
        .padding(0.01);
    svg2.append("g")
        .call(d3.axisLeft(y));



    // extract top 10 purposes each year
}

function groupByPurpose(data) {
    let resultMap = new Map();
    for(let i = 0; i < data.length; i++){
        let current = data[i];
        let purpose = current.coalesced_purpose_code;
        let amount = current.commitment_amount_usd_constant;
        let purposeName = current.coalesced_purpose_name;
        if(resultMap[purpose] === undefined){
            let purposeSummary = new Map();
            purposeSummary['value'] = parseInt(amount);
            purposeSummary['purposeName'] = purposeName;
            resultMap[purpose] = purposeSummary;
        }
        else {
            let currentRes = resultMap[purpose]['value'] + parseInt(amount);
            resultMap[purpose]['value'] = currentRes;
        }
    }
    let result = [];
    for(let currentKey in resultMap){
        let singleton = new Map();
        singleton['purpose'] = currentKey;
        singleton['value'] = resultMap[currentKey]['value'];
        singleton['purposeName'] = resultMap[currentKey]['purposeName'];
        result.push(singleton);
    }
    result.sort(function (a, b) {
        let keyA = a.value;
        let keyB = b.value;
        // Compare the 2 dates
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
    })

    return result;
}

function recordTop10Names(rawData){
    let rankedDataToPurpose = groupByPurpose(rawData);
    let rankIndex = 0;
    while(purposeNames.length < 10){
        purposeNames.push(rankedDataToPurpose[rankIndex].purposeName);
        purposeCodes.push(rankedDataToPurpose[rankIndex].purpose);
        purposeAggregateData.push(rankedDataToPurpose[rankIndex]);
        rankIndex = rankIndex + 1;
    }
}

function eachYearPurpose(rawData, purposeCode) {
    /*
    return bigMap that
    bigMap['yearSum'] = smallMap
        where smallMap have
        smallMap['1998'] = 174412
        smallMap['1999'] = 835640
        ...

        way to access
        bigMap['yearSum']['1998']

    bigMap['purposeCode'] = 214324 (which is purposeCode in params)
    bigMap['purposeName'] = fromCodeToName(bigMap['purposeCode'])

    * */
}

function globalYearSum(rawData){
    /*
    return a map that
    map['1997'] = 63282385218
    map['1998'] = 93472382782
    ...
    * */
}

function fromCodeToName(code) {
    if(code === undefined){
        return "nope";
    }
    if(code.trim() === ""){
        return "";
    }
    for(let i = 0; i < purposeAggregateData.length; i++){
        let cur = purposeAggregateData[i];
        if(cur.purpose.trim() === code.trim()){
            return cur.purposeName;
        }
    }
    return "";
}