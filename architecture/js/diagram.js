var DIAGRAM = 'svg/platform_diagram_2017-03-29/platform_diagram_2017-03-29.svg';
var COMPONENT_DATA = 'components.json';
var currentPopupHref;

document.addEventListener('click', function () {
  hidePopup();
});

function hidePopup () {
  d3.select('#popup')
    .classed('hidden', true)
}

function createPopup (data, point) {

  if (data) {
    d3.select('#popup')
      .classed('hidden', false)
      .style('left', point.x + 'px')
      .style('top', point.y + 'px')

    document.getElementById('popup-contents').scrollTop = 0

    var popup = document.getElementById('popup-contents')

    // Clear previous contents
    while (popup.firstChild) {
      popup.removeChild(popup.firstChild)
    }

    // Add contents as child of popup element
    var $div = $('<div>');
    if (data.desc && data.desc.length) {
      $div.html(data.desc);
    }
    if (data.links && data.links.length) {
      var $links = $('<div class="links"></div>');
      $.each(data.links, function(i, l){
        $links.append($('<a href="'+l.href+'" class="'+l.className+'" target="_blank">'+l.label+'</a>'))
      });
      $div.append($links);
    }
    popup.appendChild($div[0]);
  } else {
    d3.select('#popup')
      .classed('hidden', true)
  }
}

function cumulativeOffset (element) {
  var top = 0
  var left = 0
  do {
    top += element.offsetTop || 0
    left += element.offsetLeft || 0
    element = element.offsetParent
  } while (element)

  return {
    top: top,
    left: left
  }
}

function getPopupLocation (archElement, svgDoc, element) {
  var matrix = element.getScreenCTM()
  var bbox = element.getBBox()

  var x = Math.round(bbox.x + (bbox.width / 2))
  var y = (bbox.y + bbox.height)

  var svgPos = cumulativeOffset(archElement)

  var popup = document.querySelector('#popup')
  var popupStyle = getComputedStyle(popup)
  var popupWidth = parseInt(popupStyle.width.replace('px', ''))

  var svgStyle = getComputedStyle(svgDoc)
  var svgMarginLeft = parseInt(svgStyle.marginLeft.replace('px', ''))

  var location = {
    x: (matrix.a * x) + (matrix.c * y) + svgMarginLeft - Math.round(popupWidth / 2),
    y: (matrix.b * x) + (matrix.d * y) + svgPos.top - 25
  }

  return location
}

function makeSVGEl(tag, attrs) {
  var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (var k in attrs)
      el.setAttribute(k, attrs[k]);
  return el;
}

d3.json(COMPONENT_DATA, function (err, data) {
  d3.xml(DIAGRAM, function (err, doc) {
    var svg = doc.querySelector('svg');

    // Set SVG height & width
    svg.removeAttribute('height', null);

    // Append SVG document to HTML
    var archElement = document.getElementById('architecture');
    archElement.appendChild(doc.documentElement);

    var $links = $('svg a')
    $links.each(function (i) {
      var $el = $(this);
      var href = $el.attr('xl:href');

      if (href in data) {
        // console.log(href);
        var component = data[href];
        $el.addClass(component.status);
        $el.addClass(component.type);

        var $rect = $el.find('rect').first();
        var r = 10;
        var cx = parseInt($rect.attr("x")) + r;
        var cy = parseInt($rect.attr("y")) + r;
        var circle = makeSVGEl('circle', {cx: cx, cy: cy, r: r, fill: 'black'});
        $el.append(circle);

        $el.on('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          var popupShown = !d3.select('#popup').classed('hidden');
          if (currentPopupHref !== href || !popupShown) {
            createPopup(component, getPopupLocation(archElement, svg, this));
          } else {
            hidePopup();
          }
          currentPopupHref = href;
        });
      }

    });
  });
});
