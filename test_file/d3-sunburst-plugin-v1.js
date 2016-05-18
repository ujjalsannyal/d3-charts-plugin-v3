/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 * 
 */

var d3sunburst = (function(){
    var _d3sunburst = function(param){
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
            countField: "count",
            nameField: "name",
            container: "body",
            chartShowBy: "count",        //  count / size
            isTip: "false",
            usePathColor: "true",
            tipColor: "#FFFFFF"
        };
        //merging parameter object to default object
        var opts = $.extend({},defaults, param);
        //replace default to "this" obj....
        $.extend(this, opts);
//        try{
            this.width = parseInt(this.width, 10);
            this.height = parseInt(this.height, 10);
            this.padding = parseInt(this.padding, 10);
            this.marginTop = parseInt(this.marginTop, 10);
            this.marginLeft = parseInt(this.marginLeft, 10);
            this.marginRight = parseInt(this.marginRight, 10);
            this.marginBottom = parseInt(this.marginBottom, 10);
            this.countField = this.countField.toString();
            this.isTip = this.isTip.toString();
            this.isTip = returnBoolean(this.isTip);
            this.usePathColor = returnBoolean(this.usePathColor);
            this.tipColor = this.tipColor.toString();
            
            this.init();
//        }catch(error){
//            console.log("Some Error Found: "+error);
//        }
        return this;
    }
    _d3sunburst.prototype = {
        init: function(){
            var self = this;
            this.root = this.data;
            
            this.color = customeCategoryAds();
            
            this.radius = Math.min(this.width, this.height) / 2 - 3;

            this.x = d3.scale.linear()
                .range([0, 2 * Math.PI]);

            this.y = d3.scale.sqrt()
                .range([0, this.radius]);
                
            this.render();
        },
        render: function(){
            var self = this;
            
            this.svg = d3.select(this.container).append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
                .append("g")
                .attr("transform", "translate(" + this.width / 2 + "," + (this.height / 2) + ")");

            this.partition = d3.layout.partition()
                .sort(null)
                .value(function(d) {return 1;});

            this.arc = d3.svg.arc()
                .startAngle(function(d) {return Math.max(0, Math.min(2 * Math.PI, self.x(d.x)));})
                .endAngle(function(d) {return Math.max(0, Math.min(2 * Math.PI, self.x(d.x + d.dx)));})
                .innerRadius(function(d) {return Math.max(0, self.y(d.y));})
                .outerRadius(function(d) {return Math.max(0, self.y(d.y + d.dy));});
                
            this.afterRender();
        },
        afterRender: function(){
//If data is valid or not.
            if(this.root != null){
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
            this.node = this.root;
            this.grandTotal = 0;
            if(this.node.children){
                this.grandTotal = self.calSize(this.node.children);
            }else{
                this.grandTotal = parseInt(this.node[self.countField], 10);
            }
            this.amntType = this.grandTotal > 0 ? "Dr" : "Cr";
//            $(".dsh-ledgerSunBrust-header-total").text(addCommaSeparator(this.grandTotal, "l", ",", "n")+" "+this.amntType);
            
            this.value = function(d) {
                if(self.chartShowBy === "count"){
                    //Set Chart By count......
                    return 1;
                }else if(self.chartShowBy === "size"){
                    // Set Chart By Size......
                    return d[self.countField]; 
                }
            };
        },
        showGraph: function(){
            var self = this;            
            this.prepareData();
            this.path = this.svg.datum(this.root).selectAll("path")
                .data(this.partition.value(this.value).nodes)
                .enter().append("path")
                .attr("d", self.arc)
                .attr("class", " cursorPointer")
                .style("fill", function(d) {
                    return self.color((d.children ? d : d.parent)[self.nameField]);
                })
                .on("click", click)
                .each(stash);
                
            //Local Function..
            function click(d) {
                self.node = d;
                self.path.transition()
                .duration(1000)
                .attrTween("d", arcTweenZoom(d));
            }

            // Setup for switching data: stash the old values for transition.
            function stash(d) {
                d.x0 = d.x;
                d.dx0 = d.dx;
            }

            // When switching data: interpolate the arcs in data space.
            function arcTweenData(a, i) {
                var oi = d3.interpolate({x: a.x0, dx: a.dx0}, a);
                function tween(t) {
                    var b = oi(t);
                    a.x0 = b.x;
                    a.dx0 = b.dx;
                    return self.arc(b);
                }
                if (i == 0) {
                // If we are on the first arc, adjust the x domain to match the root node
                // at the current zoom level. (We only need to do this once.)
                    var xd = d3.interpolate(self.x.domain(), [self.node.x, self.node.x + self.node.dx]);
                    return function(t) {
                    self.x.domain(xd(t));
                    return tween(t);
                    };
                } else {
                    return tween;
                }
            }

            // When zooming: interpolate the scales.
            function arcTweenZoom(d) {
                var xd = d3.interpolate(self.x.domain(), [d.x, d.x + d.dx]),
                    yd = d3.interpolate(self.y.domain(), [d.y, 1]),
                    yr = d3.interpolate(self.y.range(), [d.y ? 20 : 0, self.radius]);
                return function(d, i) {
                    return i ? function(t) {return self.arc(d);}
                            : function(t) {self.x.domain(xd(t));self.y.domain(yd(t)).range(yr(t));return self.arc(d);};
                };
            }
            if(this.isTip){
                this.callTip()
            }
                
        },
        calSize: function (arr){
            var self = this;
            var total = 0;
            for(var i = 0; i<arr.length; i++){
                total += arr[i].children ? self.calSize(arr[i].children) : parseInt(arr[i][self.countField], 10);
            }
            return total;
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


            this.path
            .on("mousemove", function(d){
                var total = 0;
                if(d.children){
                    total = self.calSize(d.children);
                }else{
                    total = parseInt(d.cls_bal, 10);
                }
                var lName = d.ledgerName === "Parent" ? "Total Amount" : d.ledgerName;
                var html =  lName+" : <span><strong> "+addCommaSeparator(total, "l", ",", "n")+"</strong></span>";
                self.tip.style("left", d3.event.pageX+10+"px");
                self.tip.style("top", d3.event.pageY-25+"px");
                self.tip.style("display", "inline-block");
                self.tip.html(html);
                if(self.usePathColor){
                    self.tip.style("background", self.color(d.ledgerName));
                }else{
                    self.tip.style("background", self.tipColor);
                }
            })
            .on("mouseout", function(d){
                self.tip.style("display", "none");
            });
        },
        callNotAvailable: function(){
            this.svg.append("g")
                .append("text")
                .attr("class", "na-class")
                .attr("x",25)
                .attr("y", 9)
                .attr("dy", ".35em")
                .text("N / A");
        }
    }
    return _d3sunburst;
})();

