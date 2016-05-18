/* 
 *  Document   : D3 Single and Gropup Stack Graph Plugin.
 *  Created on : 15 Jul, 2015, 11:17:59 PM
 *  Author     : ujjal sannyal
 *  Version    : 1.00
 */


/*
 * Stack graph plugin
 */
/* 
 *  Document   : D3 Single and Gropup Stack Graph Plugin.
 *  Created on : 15 Jul, 2015, 11:17:59 PM
 *  Author     : ujjal sannyal
 *  Version    : 1.00
 */


/*
 * Stack graph plugin
 */

var d3stackgraph = (function(){
    var _d3stackgraph = function(param){
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
                tipFormat: "WHOLE",       //  whole / slice
                container: "body",
                isTip: "true",
                usePathColor: "false",
                tipColor: "#FFFFFF",
                isLegend: "false",
                dataAlignXaxix: ""
        };
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
            this.isTip = $.type(this.isTip) === "string" ? returnBoolean(this.isTip) : this.isTip;
            this.usePathColor = $.type(this.usePathColor) === "string" ? returnBoolean(this.usePathColor) : this.usePathColor;
            this.isLegend = $.type(this.isLegend) === "string" ? returnBoolean(this.isLegend) : this.isLegend;
            this.tipColor = this.tipColor.toString();
            this.dataAlignXaxix = this.dataAlignXaxix.toString();
            this.init();
        }catch(error){
            console.log("Stack Graph Some Error Found: "+error);
        }
        
        return this;
    };
    _d3stackgraph.prototype = {
        init: function(){
            var self = this;
            this.flag = false;
            
            this.width = this.width - this.marginLeft - this.marginRight,
            this.height = this.height - this.marginTop - this.marginBottom;
            
            if(this.isLegend){
                this.height -= 25; 
            }
            
            this.x0 = d3.scale.ordinal()
                .rangeRoundBands([0, this.width], 0.1);

            this.x1 = d3.scale.ordinal();

            this.y = d3.scale.linear()
                .range([this.height, 0]);

            this.xAxis = d3.svg.axis()
                .scale(this.x0)
                .orient("bottom");

            this.yAxis = d3.svg.axis()
                .scale(this.y)
                .orient("left")
                .ticks(Math.ceil( this.height / 60))
                .tickFormat(d3.format(".2s"));
                
            this.render();
        },
        render: function(){
            this.svg = d3.select(this.container).append("svg")
                .attr("width", this.width + this.marginLeft + this.marginRight)
                .attr("height", this.height + this.marginTop + this.marginBottom)
                .append("g")
                .attr("transform", "translate(" + this.marginLeft + "," + this.marginTop + ")");
            this.afterRender();
        },
        afterRender: function(){
            if(this.data !== null && this.data.length > 0){
                this.showGraph();
                if(this.isTip){
                    this.callTip();
                }
                if(this.isLegend){
                    this.attachedLegend();
                }
            }else{
                this.callNotAvailable();
            }
        },
        prepareData: function(){
            var self = this;
            this.dateRange = [];
            this.columnHeaders = d3.keys(this.data[0]).filter(function(key) {
                return $.type(self.data[0][key]) === "object";
            });
            this.columnHeaders.reverse();
            this.data.forEach(function(d) {
                var yColumn = new Array();
                d.columnDetails = [];
                for(c in self.columnHeaders){
                    // @columnHeadersObj = {Feb-13: 10, color: #A2D9E8, Feb-12: 9, orgVal: 10}
                    var columnHeadersObj = d[self.columnHeaders[c]],
                        xaxisKeys = d3.keys(columnHeadersObj).filter(function(key) {return (key !== "color")});  // @xaxisKeys = [Feb-13, Feb-12].
                    d.xaxisVal = xaxisKeys[0].split("-")[0];       // @d.xaxisVal = Feb
                    for(k in xaxisKeys){
                        self.dateRange[k] = "column"+(k+1);         // ["column1", "column2"]
                        var obj = {};
                        obj.name = self.columnHeaders[c];
                        obj.period = xaxisKeys[k];
                        obj.val = parseInt(columnHeadersObj[xaxisKeys[k]], 10);
                        //Calculate Begining value and End Value.
                        if (!yColumn[obj.period]){
                            yColumn[obj.period] = 0;
                        }
                        var yBegin = yColumn[obj.period];
                        yColumn[obj.period] += +obj.val;
                        
                        obj.yBegin = yBegin;
                        obj.yEnd = +obj.val + yBegin;
                        obj.column = self.dateRange[k];
                        //Set Object to columnDetails..
                        d.columnDetails.push(obj);
                    }                   
                }
                d.total = d3.max(d.columnDetails, function(d) { 
                            return d.yEnd; 
                        });
            });
        },
        showGraph: function(){
            var self = this;
            var colorAr = []
            this.prepareData();
            console.log("data: "+JSON.stringify(this.data));
            var maxTotal = d3.max(this.data, function(d) { 
                return d.total; 
            });
            
            if(maxTotal != 0){
                if(this.color !== null){
                    colorAr = this.color.split(",");
                    this.color = d3.scale.ordinal()
                    .range(colorAr);
                }else{
                    
                }
                
                this.x0.domain(this.data.map(function(d){return d.xaxisVal;}));
                this.x1.domain(this.dateRange).rangeRoundBands([0, this.x0.rangeBand()]);

                this.y.domain([0, maxTotal]);
                var groupSpacing = 1;
                this.svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(15," + this.height + ")")
                    .call(this.xAxis);

                this.svg.append("g")
                    .attr("class", "y axis")
                    .call(this.yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".7em")
                    .style("text-anchor", "end")
                    .text(this.yaxisLabel);
                this.stackedbar = this.svg.selectAll(".stackedbar")
                    .data(this.data)
                    .enter().append("g")
                    .attr("class", "g")
                    .attr("transform", function(d) {
                        return "translate(" + self.x0(d.xaxisVal) + ",0)";
                    });

                this.rect = this.stackedbar.selectAll("rect")
                    .data(function(d) {return d.columnDetails;})
                    .enter().append("rect")
                    .attr("width", function(){
                        return ( self.x1.rangeBand() - groupSpacing);
                    })
                    .attr("x", function(d) {
                        return self.x1(d.column) + 15;
                    })
                    .attr("y", function(d) {
                        return self.y(d.yEnd); 
                    })
                    .attr("height", function(d) {
                        return self.y(d.yBegin) - self.y(d.yEnd); 
                    })
                    .style("fill", function(d) {return self.color(d.name);});

            }else{
                this.callNotAvailable();
            }
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
            if(this.tipFormat.toUpperCase() == "WHOLE"){                
                this.stackedbar.on("mousemove", function(d){
                    console.log(JSON.stringify(d));
                    var html = "Total Sale : <span><strong> "+d["Total Sale"]+"</strong></span></br>"+  
                                "Unrealized Sale : <span><strong> "+d.columnDetails[1].val+"</strong></span></br>"+  
                                "Realized Sale : <span><strong> "+d.columnDetails[0].val+"</strong></span>";  
                        self.tip.html(html);
                        self.tip.style("left", d3.event.pageX+10+"px");
                        self.tip.style("top", d3.event.pageY-25+"px");
                        self.tip.style("display", "inline-block");
                        self.tip.html(html);
                        if(self.usePathColor){
                            self.tip.style("background", self.color(d.name)).style("text-align", "left");
                        }else{
                            self.tip.style("background", self.tipColor).style("text-align", "left");
                        }
                })
                .on("mouseout", function(d){
                    self.tip.style("display", "none");
                }).style("cursor","pointer");
            }else if(this.tipFormat.toUpperCase() == "SLICE"){
                
            }
        },
        attachedLegend: function(){
            var arr = [],
                self = this;
            this.data[0].columnDetails.forEach(function(d){
                if(d.column === self.dateRange[0]){
                    arr.push(d.name);
                }
            });
            var svg2 = d3.select(this.container)
                        .append("svg")
                        .attr("width", this.width + this.marginLeft + this.marginRight)
                        .attr("height", 25);
            var svg2_g = svg2.append("g")
                        .attr("transform", "translate(" + 40 + "," + 6 + ")");
                           
            var legend = svg2_g.selectAll(".legend")
                            .data(arr.slice())
                            .enter().append("g")
                            .attr("class", "legend")
                            .attr("transform", function(d, i) {
                                return "translate("+ i * 100 +",0)";
                            });

            legend.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 14)
                .attr("height", 14)
                .style("fill", this.color);

            legend.append("text")
                .attr("x",20)
                .attr("y", 9)
                .attr("dy", ".35em")
                .text(function(d) {
                    return d;
                });
        },
        callNotAvailable: function(){
            
        }
    };
    return _d3stackgraph;
})();
