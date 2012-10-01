var cumulativeOffset = function(element) {
  var top = 0, left = 0;
  do {
    top  += element.offsetTop  || 0;
    left += element.offsetLeft || 0;
  } while (element = element.offsetParent);
  return {left: left, top: top};
};

var stopEvent = function(e) {
  e.preventDefault();
  e.stopPropagation();
};

var ColorPicker = function(element, color, callback) {
  this.document = element.ownerDocument;
  var sbWrapper = element.querySelector('div.saturation_brightness');
  this.setupPicker(sbWrapper, 'sb', 'main');
  this.setupPicker(sbWrapper, 'saturation', 'saturation');
  this.setupPicker(sbWrapper, 'brightness', 'brightness');
  this.setupPicker(element.querySelector('div.opacity'), 'opacity');
  this.setupPicker(element.querySelector('div.hue'), 'hue');
  this.sbPickerColor      = new Color.HSV(0, 1, 1);
  this.opacityPickerColor = new Color.HSV();
  this.setupBounds();
  this.setupObservers();
  this.callback = callback;
  this.setColor(color);
};

ColorPicker.prototype = {
  Position: (function() {
    var style = (document.body || document.documentElement).style, setterName;
    if ((style.transform !== undefined && (setterName = 'transform')) || (style.MozTransform !== undefined && (setterName = 'MozTransform'))) {
      return {
        set: function(element, left, top) {
          element.leftPosition = left;
          element.topPosition  = top;
          element.style[setterName] = 'translate(' + (left || 0) + 'px, ' + (top || 0) + 'px)';
        },
        
        get: function(element, positionProperty) {
          return element[positionProperty + 'Position'] || 0;
        }
      };
    } else {
      return {
        set: function(element, left, top) {
          var style = element.style;
          if (left !== undefined) { style.left = left + 'px'; }
          if (top  !== undefined) { style.top  = top  + 'px'; }
        },
        
        get: function(element, positionProperty) {
          return parseInt(element.style[positionProperty]);
        }
      };
    }
  })(),
  
  setupObservers: function() {
    this.sbPicker.addEventListener('mousedown', this.sbMousedown, false);
    this.opacityPicker.addEventListener('mousedown', this.opacityMousedown, false);
    this.huePicker.addEventListener('mousedown', this.hueMousedown, false);
    var body = this.document.body;
    body.addEventListener('mousemove', this.mouseMove, false);
    body.addEventListener('mouseup', this.mouseUp, false);
    body.addEventListener('mousedown', this.bodyMouseDown, false);
  },
  
  dispose: function() {
    this.sbPicker.removeEventListener('mousedown', this.sbMousedown);
    this.opacityPicker.removeEventListener('mousedown', this.opacityMousedown);
    this.huePicker.removeEventListener('mousedown', this.hueMousedown);
    var body = this.document.body;
    body.removeEventListener('mousemove', this.mouseMove);
    body.removeEventListener('mouseup', this.mouseUp);
    body.removeEventListener('mousedown', this.bodyMouseDown);
  },
  
  setupPicker: function(wrapperElement, pickerType, handleClass) {
    wrapperElement.borders = this.getBorderWidths(wrapperElement);
    this[pickerType + 'Picker'] = wrapperElement;
    this[pickerType + 'Handle'] = wrapperElement.querySelector('img' + (handleClass ? '.' + handleClass : ''));
    this[pickerType + 'Width']  = wrapperElement.offsetWidth  - wrapperElement.borders.left - wrapperElement.borders.right;
    this[pickerType + 'Height'] = wrapperElement.offsetHeight - wrapperElement.borders.top  - wrapperElement.borders.bottom;
  },

  getBorderWidths: function(el) {
    var borders = {}, borderTypes = ['top', 'right', 'bottom', 'left'], borderType, borderCSSName;
    for (var i = 0; borderType = borderTypes[i++];) {
      borderCSSName = 'border' + borderType.charAt(0).toUpperCase() + borderType.substring(1) + 'Width';
      borders[borderType] = parseInt(el.style[borderCSSName] || document.defaultView.getComputedStyle(el, null)[borderCSSName], 10);
    }
    return borders;
  },

  setupBounds: function() {
    var methodsToBind = ['sbMousedown', 'opacityMousedown', 'hueMousedown', 'mouseMove', 'mouseUp', 'browserMouseUp'], i = methodsToBind.length;
    while(i--) { this[methodsToBind[i]] = bind(this[methodsToBind[i]], this); }
  },

  popUpOpened: function() {
    globalDocument.addEventListener('mouseup', this.browserMouseUp, false);
  },

  popUpClosed: function() {
    globalDocument.removeEventListener('mouseup', this.browserMouseUp, false);
  },

  cumulativeOffsetWithBorders: function(element) {
    var offset = cumulativeOffset(element);
    return {top: offset.top + element.borders.top, left: offset.left + element.borders.left};
  },

  sbMousedown: function(e) {
    this.sbDrag = true;
    var target = e.target;
    this.sbExplicitHandle = (target == this.brightnessHandle && this.brightnessHandle) || (target == this.saturationHandle && this.saturationHandle);
    this.offset = this.cumulativeOffsetWithBorders(this.sbPicker);
    this.mouseMove(e);
  },

  opacityMousedown: function(e) {
    this.opacityDrag = true;
    this.offset = this.cumulativeOffsetWithBorders(this.opacityPicker);
    this.mouseMove(e);
  },

  hueMousedown: function(e) {
    this.hueDrag = true;
    this.offset  = this.cumulativeOffsetWithBorders(this.huePicker);
    this.mouseMove(e);
  },

  mouseMove: function(e) {
    if (this.sbDrag) {
      stopEvent(e);
      var top = e.pageY - this.offset.top, left = e.pageX - this.offset.left;
      if (this.sbExplicitHandle == this.brightnessHandle) {
        left = this.Position.get(this.sbHandle, 'left');
      } else if (this.sbExplicitHandle == this.saturationHandle) {
        top = this.Position.get(this.sbHandle, 'top');
      }
      this.setSbPicker(top, left);
      this.colorChanged();
    } else if (this.opacityDrag) {
      stopEvent(e);
      this.setOpacity(e.pageX - this.offset.left);
      this.colorChanged();
    } else if (this.hueDrag) {
      stopEvent(e);
      this.setHue(e.pageY - this.offset.top);
      this.colorChanged();
    }
  },

  mouseUp: function(e) {
    this.mouseMove(e);
    this.notDragging();
  },

  notDragging: function() {
    this.sbDrag = this.hueDrag = this.opacityDrag = false;
  },

  browserMouseUp: function() {
    this.notDragging();
  },

  bodyMouseDown: function(e) {
    // stop user from accidentally doing mouse selection (dragger IMG elements are selectable and look ugly when in selection)
    e.preventDefault();
  },

  setColor: function(color) {
    var hsv = color.toHSV();
    this.colorTypeConverter = 'to' + color.colorType.toUpperCase();
    this.setHue(Math.round(Math.abs(1 - hsv.getH()) * this.hueHeight));
    this.setSbPicker(this.sbHeight - Math.round(hsv.getV() * this.sbHeight), Math.round(hsv.getS() * this.sbWidth));
    this.setOpacity(Math.round(color.a * this.opacityWidth));
  },
  
  setSbPicker: function(top, left) {
    top  = this.makeWithin(top,  0, this.sbHeight);
    left = this.makeWithin(left, 0, this.sbWidth);
    this.v = (this.sbHeight - top) / this.sbHeight;
    this.s = left / this.sbWidth;
    this.Position.set(this.sbHandle, left, top);
    this.Position.set(this.brightnessHandle, undefined, top);
    this.Position.set(this.saturationHandle, left);

    this.updateOpacityPickerColor();
  },

  setHue: function(top) {
    top    = this.makeWithin(top, 0, this.hueHeight);
    this.h = (this.hueHeight - top) / this.hueHeight;
    this.Position.set(this.hueHandle, undefined, top);

    this.updateSbPickerColor();
    this.updateOpacityPickerColor();
  },
  
  setOpacity: function(left) {
    left = this.makeWithin(left, 0, this.opacityWidth);
    this.a = left / this.opacityWidth;
    this.Position.set(this.opacityHandle, left);
  },

  updateSbPickerColor: function() {
    var color = this.sbPickerColor;
    color.setH(this.h);
    this.sbPicker.style.backgroundColor = color.toRGB().toString();
  },

  updateOpacityPickerColor: function() {
    var color = this.opacityPickerColor, startColor, endColor;
    color.setH(this.h);
    color.setS(this.s);
    color.setV(this.v);
    color.setA(0);
    startColor = color.toRGB().toString();
    color.setA(1);
    endColor = color.toRGB().toString();
    this.opacityPicker.style.backgroundImage = '-moz-linear-gradient(0deg, ' + startColor + ', ' + endColor + '), url("chrome://firepicker/skin/checkboard.png")';
  },

  colorChanged: function() {
    this.callback(this.getCurrentColor()[this.colorTypeConverter]());
  },

  getCurrentColor: function() {
    return new Color.HSV(this.h, this.s, this.v, this.a);
  },

  makeWithin: function(val, min, max) {
    return val < min ? min : (val > max ? max : val);
  }
};

document.expose = function(values) {
  for (var valueName in values) {
    window[valueName] = values[valueName];
  }
};

document.initColorPicker = function(color, callback) {
  if (!window.colorPicker) {
    colorPicker = new ColorPicker(document.getElementById('picker'), color, callback);
  } else {
    colorPicker.callback = callback;
    colorPicker.setColor(color);
  }
  colorPicker.popUpOpened();
};

document.popUpClosed = function() {
  if (window.colorPicker) { colorPicker.popUpClosed(); }
};