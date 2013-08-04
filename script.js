/*
 *    script.js
 *    January 2010 | jesse dot tane at gmail dot com
 *    Javascript for sethtane.com
 *
 */

//
//    Global vars
//

body = null;
browser = null;
activeSlideshow = null;
currentSlide = 0;
slideDelay = 4000;
fadeDelay = 300;

// preload slideshow images
new Image().src = 'prev.png';
new Image().src = 'play.png';
new Image().src = 'stop.png';
new Image().src = 'next.png';

//
//    Event handlers
//

window.onload = ready;
$(document).ready(slideshowSetup);

//
//    Functions
//

function ready()
{
      if(parent != window)
      {
            body = $(getRoot().document.getElementsByTagName("body")[0]);
            var frame = $(parent.document.getElementById("frame"));
            frame.css("height", "300px");
            frame.css("height", $(document).height());
            $("*.thumbnail").click(popup);
      }
      
      if(navigator.userAgent.search("MSIE") > -1) browser = "IE";
      else if(navigator.userAgent.search("iPhone") > -1) browser = "mobile";
      else if(navigator.userAgent.search("mobile") > -1) browser = "mobile";
      else browser = "ok";
}

function slideshowSetup()
{
      var show = $(".slideshow");
      if(show.length > 0)
      {
            $(".replaceWithSlideshow").html("")

            var holder = $("<div class='slideshowInfo'>").css({
                  "position" : "relative",
                  "display" : "table",
                  "margin-left" : "auto",
                  "margin-right" : "auto",
                  "margin-top" : "15px"
            });
            
            var leftHolder = $("<div>").css({
                  "position" : "relative",
                  "text-align" : "left",
                  "display" : "table-cell"
            });
            
            var rightHolder = $("<div>").css({
                  "position" : "relative",
                  "text-align" : "right",
                  "display" : "table-cell",
                  'min-width' : 110
            });

            //
            //
            //

            var description = $("<span class='slideshowDescription'></span>");
            var controls = $("<span class='slideshowControls'>");
            var btn = $("<img src='stop.png' />").css({
                  "vertical-align" : "middle",
                  "cursor" : "pointer",
                  "margin-left" : "10px",
                  "height" : 18,
                  "opacity" : 0.8
            });
            var pbtn = btn.clone().attr('src', 'prev.png');
            var nbtn = btn.clone().attr('src', 'next.png');
            
            holder.append(leftHolder.append(description));
            holder.append(rightHolder.append(controls));
            rightHolder.append(pbtn);
            rightHolder.append(btn);
            rightHolder.append(nbtn);
            holder.append()
            show.append(holder);
            
            slideDelay = Number(show.attr("delay"));
            fadeDelay = Number(show.attr("fade"));
           
            // events
            
            var playPause = function ()
            {
                  if(activeSlideshow == null)
                  {
                        activeSlideshow = setInterval("nextSlide()", slideDelay);
                        $(this).attr("src", "stop.png");
                        //$(".slideshowControls").html("<i>Pause</i>");
                  }
                  else
                  {
                        clearInterval(activeSlideshow);
                        activeSlideshow = null;
                        $(this).attr("src", "play.png");
                        //$(".slideshowControls").html("<i>Play</i>");
                  }
            };
            
            btn.click(playPause);
            pbtn.click(function () {
              prevSlide();
              playPause();
              playPause();
            });
            nbtn.click(function () {
              nextSlide();
              playPause();
              playPause();
            });
            
            
            // only when ready
            
            var slide = $("#slide" + currentSlide).css("display", "inline-block");
            var image = new Image();
            image.onload = function()
            {
                  show.css("display", "inline-block");
                  $(".slideshowInfo").css("width", slide.width());
				          description.html(slide.attr("description"));
                  activeSlideshow = setInterval("nextSlide()", slideDelay);
				$(".loading").remove();
            	$(".replaceWithSlideshow").remove();
            } 
            image.src = slide.attr("src");
      }
}

function nextSlide () {
  changeSlide();
}

function prevSlide () {
  changeSlide(true);
}

function changeSlide (back) {
      var prevSlide = $("#slide" + currentSlide);
      if (back) currentSlide--;
      else currentSlide++;
      var nextSlide = $("#slide" + currentSlide);
      var info = $(".slideshowInfo");
      var description = $(".slideshowDescription");
      
      if(nextSlide.length == 0) {
        currentSlide = (back) ? $('.slide').length-1 : 0;
        nextSlide = $("#slide" + currentSlide);
      }
      
      var ps = prevSlide;
      var ns = nextSlide;
      var callback = function () {
            ps.css("display", "none");
            ns.css({"display" : "inline-block", "opacity" : "0"});
            description.html(ns.attr("description"));
            info.css("width", (ns.width() > 450) ? ns.width() : 450);
            ns.animate({"opacity" : "1.0"}, fadeDelay);
            info.animate({"opacity" : "1.0"}, fadeDelay);
      }
      
      if(browser == "ok")
      {
            prevSlide.animate({"opacity" : "0"}, fadeDelay, callback);
            info.animate({"opacity" : "0"}, fadeDelay);
      }
      else
      {
            prevSlide.css("display", "none");
            nextSlide.css("display", "inline-block");
            info.css("width", nextSlide.width());
            description.html(nextSlide.attr("description"));
      }
}

function popup()
{
      var root = getRoot();
      body.css("overflow", "hidden");
      
      var src = $(this).attr("src");
      var thumb = src.split(".");
      var fullsize = thumb[0].slice(0, thumb[0].length-1) + "." + thumb[1];
      
      var bg = $("<div class='popup'>").css({
            "position" : "fixed",
            "top" : "0px",
            "left" : "0px",
            "width" : "100%",
            "height" : "100%",
            "background-color" : "#000",
            "opacity" : "0.95",
            "filter" : "alpha(opacity=95)",
            "cursor" : "pointer"
      });
      
      var slideShow = $("<div class='popup'>").css({
            "position" : "fixed",
            "top" : "0px",
            "left" : "0px",
            "width" : "100%",
            "height" : "100%",
            "text-align" : "center",
            "overflow" : "auto",
            "cursor" : "pointer",
			"background-color" : "transparent",
      });
      
      var slide = $("<img class='popup' src='" + fullsize + "' />").css({
            "background-color" : "#000",
            "border" : "1px solid #CCC",
      });
      
      var slideBg = $("<div id='slideBg' />").css({
            "background-color" : "#CCC",
            "position" : "relative",
            "top" : "30px",
            "margin-left" : "auto",
            "margin-right" : "auto"
      });
      
      var loading = $("<div id='loading'>Loading...</div>").css({
            "width" : "80px",
            "background-color" : "#CCC",
            "padding-top" : "5px",
            "padding-bottom" : "5px",
            "position" : "relative",
            "top" : "30px",
            "margin-left" : "auto",
            "margin-right" : "auto"
      });
      
      if(browser == "mobile")
      {
            bg.css("height", (body.height() > $(root).height()) ? body.height() : $(root).height());
            slideShow.css("height", (body.height() > $(root).height()) ? body.height() : $(root).height());
            root.scrollTo(0,1);
      }
      if(browser == "ok") slide.css("opacity", "0");
      body.append(bg.click(root.closePopup));
      body.append(slideShow.click(root.closePopup));
      slideShow.append(loading);
      
      var loader = new Image();
      loader.onload = function()
	{
            slideBg.css({
                  "width" : loading[0].offsetWidth,
                  "height" : loading[0].offsetHeight
            });
            
            loading.remove();
            slideShow.append(slideBg);
            
		var w = loader.width + 2;
		var h = loader.height + 2;
		
		slideBg.animate({
                  "width" : w
            }, 300, "swing", callback1);
		
		function callback1()
		{
			slideBg.animate({
                        "height" : h
                  }, 300, "swing", callback2);
		}
		
		function callback2()
		{
                  slideBg.append(slide);
                  if(browser == "ok")
                  {
                        slide.animate({
                              "opacity" : "1.0"
                        }, 300);
                  }
                  
                  var holder = $("<div/>").css({
                        "margin-left" : "auto",
                        "margin-right" : "auto",
                        "padding-bottom" : "20px",
                        "position" : "relative",
                        "top" : "50px",
                        "width" : slide.width(),
                        "text-align" : "left",
                        "display" : "table",
						"background-color" : "transparent"
                  });
                  
                  var leftHolder = $("<div/>").css({
                        "position" : "relative",
                        "text-align" : "left",
                        "display" : "table-cell",
						"background-color" : "transparent"
                  });
                  
                  var rightHolder = $("<div/>").css({
                        "position" : "relative",
                        "text-align" : "right",
                        "display" : "table-cell",
						"background-color" : "transparent",
                  });
                  
                  holder.append(leftHolder);
                  holder.append(rightHolder);
                  slideShow.append(holder);
                  
                  var info = $("img[src='" + src + "']").next().children();
                  leftHolder.append($("<span class='workTitle slideInfo'>" + $(info[0]).html() + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span>").css("letter-spacing", "1px"));
                  rightHolder.append($("<span class='slideInfo'>" + $(info[2]).html() + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span>"));
                  rightHolder.append($("<span class='slideInfo'>" + $(info[4]).html() + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span>"));
                  rightHolder.append($("<span class='slideInfo'>" + $(info[6]).html() + "</span>"));
		}
      }
      loader.src = fullsize;
}

function closePopup()
{
      var p = $("*.popup");
      if(p.length > 0)
      {
            p.remove();
            $(document.body).css("overflow", "auto");
            window.scrollBy(0,-1);
            window.scrollBy(0,1);   // make scrollbar reappear in safari hack...
      }
}

//
//    Helper functions
//

function getRoot()
{
      var p = window;
      while(p != p.parent) p = p.parent;
      return p;
}

$.prototype.center = function()
{
	var body = $(getRoot().document.getElementsByTagName("body")[0]);
	this.css(
	{
		"left" : body[0].clientWidth / 2 - this.width() / 2,
		"top" : body[0].clientHeight / 2 - this.height() / 2
	});
}
