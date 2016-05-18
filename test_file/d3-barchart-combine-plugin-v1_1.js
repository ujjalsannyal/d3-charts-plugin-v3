
/* 
 *  Document   : D3 Single and Gropup Bar Chart Plugin.
 *  Created on : 4 Jul, 2015, 11:17:59 PM
 *  Author     : ujjal sannyal
 *  Version    : 1.00
 */


var d3BarChart = (function(){
    var _d3BarChart = function(param){
        //Defaults Parameter Set..
        var defaults = {
                barGraphType: "single",
                width: 200,
                height: 200,
                data: null,
                color: null,
                padding: 5,
                marginTop: 20,
                marginLeft: 20,
                marginRight: 20,
                marginBottom: 20,
                yaxisLabel: "Number",
                container: "body",
                xAxisField: "name",
                isTip: "false",
                usePathColor: "true",
                tipColor: "#FFFFFF",
                dataAlignXaxix: ""
            };
        //merging parameter object to default object
        var opts = $.extend({},defaults, param);
        //replace default to "this" obj....
        $.extend(this, opts);
        try{
            this.barGraphType = this.barGraphType.toString();
            this.width = parseInt(this.width, 10);
            this.height = parseInt(this.height, 10);
            this.padding = parseInt(this.padding, 10);
            this.marginTop = parseInt(this.marginTop, 10);
            this.marginLeft = parseInt(this.marginLeft, 10);
            this.marginRight = parseInt(this.marginRight, 10);
            this.marginBottom = parseInt(this.marginBottom, 10);
            this.yaxisLabel = this.yaxisLabel.toString();
            this.xAxisField = this.xAxisField.toString();
            this.isTip = returnBoolean(this.isTip);
            this.usePathColor = returnBoolean(this.usePathColor);
            this.tipColor = this.tipColor.toString();
            this.dataAlignXaxix = this.dataAlignXaxix.toString();
            this.init();
        }catch(error){
            console.log("Some Error Found: "+error);
        }
        return this;        
    }
//Prototype Set..
    _d3BarChart.prototype = {
        init: function(){
//Calculate Height & Width..
            this.width = this.width - this.marginLeft - this.marginRight;
            this.height = this.height - this.marginTop - this.marginBottom;
//Set ordinal scale and rangeRoundBands for x-axis in this.x0.             
            this.x0 = d3.scale.ordinal()
            .rangeRoundBands([0,this.width], .1);  // .1 is a outer padding
//Set ordinal scale for x-axis in this.x1.
            this.x1 = d3.scale.ordinal();
//Set linear scale and range for y-axis in this.y.
            this.y = d3.scale.linear()
            .range([this.height, 0]);
//Define x-axis ..
            this.xAxis = d3.svg.axis()
            .scale(this.x0)
            .orient("bottom");
//Define y-axis ..
            this.yAxis = d3.svg.axis()
            .scale(this.y)
            .orient("left")        
            .tickFormat(d3.format(".2s"))
            .ticks(Math.ceil( this.height / 60));
            //Render..
            this.render();
        },
        render: function(){
            this.svg = d3.select(this.container).append("svg")
            .attr("width",this.width + this.marginLeft + this.marginRight)
            .attr("height", this.height + this.marginTop + this.marginBottom)
            .append("g")
            .attr("transform", "translate(" + this.marginLeft + "," + this.marginTop + ")");
            this.afterRender();
        },
        afterRender: function(){
//If data is valid or not.
            if(this.data != null && this.data.length > 0){
                this.showGraph();
                //Tip Function Calling..
                if(this.isTip){
                    this.callTip();
                }
            }else{
                this.callNotAvailable();
            }
        },
        prepareData: function(){
            var self = this;
/* 
 * Set dataRange array for setting up bar position on the x-axis, spliting up the two values
 * and push to the dataRange array.
 */            
            this.dateRange = [];
            this.dateRange = d3.keys(this.data[0]).filter(function(key){return key !== self.xAxisField});
           
/*
 * Arrange the data in the format of.............
 * data = [{
 *  details: [{
 *    name: first key name,
 *    value: value of that key  
 *  },{
 *    name: second key name,
 *    value: value of that key  
 *  }]
 * }, .........]
 */            
            this.data.forEach(function(d) {
                d.details = self.dateRange.map(function(name) {return {name: name, value: +Math.abs(parseInt(d[name], 10))};});
            });
        },
        showGraph: function(){
            var self = this;
/*
 * set data for graph.
 */                        
            this.prepareData();

            if(this.color != null){
                this.color = d3.scale.ordinal()
                .range(this.color);
            }else{
//this.color array set.
                var colorPar = {
                    "length": this.dateRange.length,
                    "colortype": "gen",
                    "startingColor": "B"
                };
                this.color = d3.scale.ordinal()
                .range(getColor(colorPar));
            }
/*
 * Setting up x-axis. where the month will display.......... 
 * using x0.domain it will display the text on the x-axis......
 * data.map() return the array of month name....
 */
            this.x0.domain(this.data.map(function(d) {
                return d[self.xAxisField];
            }));

/*
 * x1.domain() set the bar chart position. as per the dataRange array is set...
 * rangeRoundBands() set the range of the bar chart.... 
 */

            this.x1.domain(this.dateRange).rangeRoundBands([0, this.x0.rangeBand()]);
/*
 * y.domain() set range of domain. 0 to max value.
 */            
            this.y.domain([0, d3.max(this.data, function(d) {
                return d3.max(d.details, function(d) {
                    return d.value;
                });
            })]);
      
/*
 * Append the x-axis text. which will display underneath the x-axis.......
 */
            this.text = this.svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(15," + this.height + ")")
                .call(this.xAxis)
                .selectAll("text");
                
            if(this.dataAlignXaxix == "break"){
                this.text.call(dataAlignXaxix, this.x0.rangeBand());
            }else if(this.dataAlignXaxix == "rotate"){
                this.text.style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function(d) {
                        return "rotate(-41)"
                    });
            }
               
/* 
 * Append the y-axis text. which will display besides the x-axis.......
 */

            this.svg.append("g")
                .attr("class", "y axis")
                .call(this.yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(this.yaxisLabel);

/* 
 * create rectangle..........
 */
            this.xAxisText = this.svg.selectAll(".xAxisText")
                            .data(this.data)
                            .enter().append("g")
                            .attr("class", "g")
                            .attr("transform", function(d) {
                                return "translate(" + self.x0(d[self.xAxisField]) + ",0)";
                            });

            this.rect = this.xAxisText.selectAll("rect")
                .data(function(d) {
                    return d.details;
                })
                .enter().append("rect")
                .attr("width", this.x1.rangeBand())
                .attr("x", function(d) {
                    return self.x1(d.name) + 15;
                })
                .attr("y", function(d) {
                    return self.y(d.value);
                })
                .attr("class", "cursorPointer")
                .attr("height", function(d) {
                    return self.height - self.y(d.value);
                })
                .style("fill", function(d) {
                    return self.color(d.name);
                });
                    
        },
        callTip: function(){
/* 
 * Append a div to the body for tip use............. 
 */
            var self = this;
            this.tip = "";
            if($(".toolTip").length === 0){
                this.tip = d3.select("body").append("div").attr("class", "toolTip").style("background", "#fff");
            }else{
                this.tip = d3.select(".toolTip");
            }

            this.rect.on("mousemove", function(d){
                var amt = parseFloat(d.value) < 0 ? "0" : d.value;
                var html = d.name+" : <span><strong> "+amt+"</strong></span>";
                self.tip.style("left", d3.event.pageX+10+"px");
                self.tip.style("top", d3.event.pageY-25+"px");
                self.tip.style("display", "inline-block");
                self.tip.html(html);
                if(self.usePathColor){
                    self.tip.style("background", self.color(d.name));
                }else{
                    self.tip.style("background", self.tipColor);
                }
            })
            .on("mouseout", function(d){
                self.tip.style("display", "none");
            }).style("cursor","pointer");
        },
        callNotAvailable: function(){
            this.svg.append("g")
                .attr("transform", "translate(" + ((this.width / 2) - this.marginLeft) + "," + ((this.height / 2) - this.marginTop) + ")")
                .append("text")
                .attr("class", "na-class")
                .attr("x",25)
                .attr("y", 9)
                .attr("dy", ".35em")
                .text("N / A");
        }
        
    };
    return _d3BarChart;
})();

/*************************************************Breaking x axis text****************************************************************/

function dataAlignXaxix(text, width) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
        }
    });
}