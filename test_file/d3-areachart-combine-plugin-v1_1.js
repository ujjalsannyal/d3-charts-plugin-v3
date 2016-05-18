
/* 
 *  Document   : D3 area Chart Plugin.
 *  Created on : 7 Jul, 2015, 11:50:59 PM
 *  Author     : ujjal sannyal
 *  Version    : 1.00
 */

var d3areachart = (function(){
    var _d3areachart  = function(param){
        var defaults = {
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
            yAxisField: "amount",
            interpolate: "basis",    // basis / linear
            isTip: "false",
            usePathColor: "true",
            tipColor: "#FFFFFF",
            dataAlignXaxix: "rotate"  // rotate / break
        }
        //merging parameter object to default object
        var opts = $.extend({},defaults, param);
        //replace default to "this" obj....
        $.extend(this, opts);
        try{
            this.width = parseInt(this.width, 10);
            this.height = parseInt(this.height, 10);
            this.padding = parseInt(this.padding, 10);
            this.marginTop = parseInt(this.marginTop, 10);
            this.marginLeft = parseInt(this.marginLeft, 10);
            this.marginRight = parseInt(this.marginRight, 10);
            this.marginBottom = parseInt(this.marginBottom, 10);
            this.yaxisLabel = this.yaxisLabel.toString();
            this.xAxisField = this.xAxisField.toString();
            this.yAxisField = this.yAxisField.toString();
            this.interpolate = this.interpolate.toString();
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
    _d3areachart .prototype = {
        init: function(){
//Calculate Height & Width..
            this.width = this.width - this.marginLeft - this.marginRight;
            this.height = this.height - this.marginTop - this.marginBottom;
//Set Week Format and Time format Function..             
            this.week = d3.time.format("%Y-%m-%d").parse;
            this.customTimeFormat = d3.time.format("%b-%U"); 
            if(this.color === null){
//this.color array set.
                var colorPar = {
                    "length": 1,
                    "colortype": "gen"
                };
                this.color = getColor(colorPar);
            }
            
            this.x = d3.time.scale()
            .range([0, this.width]);

            this.y = d3.scale.linear()
                .range([this.height, 0]);
        
            this.xAxis = d3.svg.axis()
                .scale(this.x)
                .tickFormat(this.customTimeFormat)
                .orient("bottom");

            this.yAxis = d3.svg.axis()
                .scale(this.y)
                .orient("left")       
                .tickFormat(d3.format(".2s"))
                .ticks(Math.ceil( this.height / 60));
                
                this.render();
        },
        render: function(){
            var self = this;
            
            
            this.area = d3.svg.area()
                .interpolate(this.interpolate)
                .x(function(d) {return self.x(d[self.xAxisField]);})
                .y0(this.height)
                .y1(function(d) {return self.y(d[self.yAxisField]);});
                
            this.svg = d3.select(this.container).append("svg")
                .attr("width", this.width + this.marginLeft + this.marginRight)
                .attr("height", this.height + this.marginTop + this.marginBottom)
                .append("g")
                .attr("transform", "translate(" + this.marginLeft  + "," + this.marginTop + ")");
                
            this.afterRender();
        },
        afterRender: function(){   
//If data is valid or not.
            if(this.data != null && this.data.length > 0){
                this.showGraph();
            }else{
                this.callNotAvailable();
            }

//Tip Function Calling..
            if(this.isTip){
                this.callTip();
            }  
        },
        prepareData: function(){
            var self = this;
            this.data.forEach(function(d) {
                    d[self.xAxisField] = self.week(d[self.xAxisField]);
                    d[self.yAxisField] = +d[self.yAxisField];
                });
        },
        showGraph: function(){
            var self = this;
            
            this.prepareData();
//Set Y domain and X domain value.
            this.x.domain(d3.extent(this.data, function(d) {return d[self.xAxisField];}));
            this.y.domain(d3.extent(this.data, function(d) {return d[self.yAxisField];}));
//Set Style and format of text shown in X axis..
            this.text = this.svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + this.height + ")")
                .call(this.xAxis);
// Set style(rotate or break) text on x-axis..
            if(this.dataAlignXaxix == "break"){
                this.text.call(dataAlignXaxix, this.x.rangeBand());
            }else if(this.dataAlignXaxix == "rotate"){
                this.text.selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function(d) {
                        return "rotate(-41)"
                    });
            }
//Append @g for Y-axis, and append lable text for y-axis..
            this.svg.append("g")
                .attr("class", "y axis")
                .call(this.yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(this.yaxisLabel);
//Set path for the area..
            this.path = this.svg.append("path")
                .datum(this.data)
                .attr("class", "area dynamic_chart")
                .attr("d", this.area)
                .style("fill", this.color[0]);
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
// Get Next Value..
            var bisectDate = d3.bisector(function(d) {return d[self.xAxisField];}).left;

            this.path.on("mousemove", function(d){
                var x0 = self.x.invert(d3.mouse(this)[0]),
                    i = bisectDate(self.data, x0, 1),
                    d0 = self.data[i - 1],
                    d1 = self.data[i],
                    d = x0 - d0[self.xAxisField] > d1[self.xAxisField] - x0 ? d1 : d0;
                    self.tip.style("display", "inline-block");
//                    console.log("json: "+JSON.stringify(d));
                    var html = self.customTimeFormat(d[self.xAxisField])+" : <span><strong> "+addCommaSeparator(d[self.yAxisField], "l", ",", "n")+"</strong></span>";                        
                    self.tip.html(html);
                    var divWidth = d3.event.pageX+10 + $(".toolTip:visible").width(); 
                    if(divWidth > $(window).width()){
                        var pos = d3.event.pageX - 10 - $(".toolTip:visible").width();
                        self.tip.style("left", pos+"px"); 
                    }else{
                        self.tip.style("left", d3.event.pageX+10+"px");
                    }
                    self.tip.style("top", d3.event.pageY-25+"px");
                    if(self.usePathColor){
                        self.tip.style("background", self.color[0]);
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
    return _d3areachart;
})();
