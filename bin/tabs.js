var tabs;
var tabbuttons;

// Creates the tabbar based on the available tabs.
function init() {
	tabs = document.getElementsByClassName("visualizationtab");
	var tabbar = document.getElementById("tabbar");
	for (var i = 0; i < tabs.length; i++) {
		tabs[i].className = "visualizationtab hiddentab";
		tabbar.innerHTML += "<div class='tabbutton unselected' onclick='selectVisualizationTab(" + i + ")'><span>" + tabs[i].getAttribute("data-visualization-title") + "</span></div>"
	}
	tabbuttons = document.getElementsByClassName("tabbutton");
	
	
}

// Changes the active tab to be the nth tab
function selectVisualizationTab(n) {
	for (var i = 0; i < tabs.length; i++) {
		if (tabs[i].className == "visualizationtab showntab") {
			tabs[i].className = "visualizationtab hiddentab";
		}
		if (tabbuttons[i].className == "tabbutton selected") {
			tabbuttons[i].className = "tabbutton unselected";
		}
	}
	tabs[n].className = "visualizationtab showntab";
	tabbuttons[n].className = "tabbutton selected";
}

window.onload = init;

