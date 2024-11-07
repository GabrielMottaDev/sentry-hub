// src/utils/stringExtensions.js

String.prototype.capitalize = function (capitalizeAll) {
    if (capitalizeAll) {
      return this.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    } else {
      return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
    }
  };
  