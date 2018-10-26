
/**
 * @returns {Boolean}
 */
export function isBrowser() {
    return typeof window !== 'undefined';
}

/**
 * @returns {Boolean}
 */
export function isAndroid() {
    if (isBrowser()) {
        const userAgent = navigator.userAgent || navigator.vendor;
        return /android/i.test(userAgent);
    }
    return false;
}

/**
 * @returns {Boolean}
 */
export function isIPhone() {
    if (isBrowser()) {
        const userAgent = navigator.userAgent || navigator.vendor;
        return /iphone/i.test(userAgent);
    }
    return false;
}

/**
 * @returns {Boolean}
 */
export function isMobileOrTablet() {
    if (isBrowser()) {
        return isAndroid() || isIPhone() || /webOS|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(navigator.userAgent);
    }
    return false;
}

/**
 * @returns {Boolean}
 */
export function isMobile() {
    return isAndroid() || isIPhone();
}

/**
 * @returns {Boolean}
 */
export function isDesktop() {
    return isBrowser() && !isMobileOrTablet();
}

/**
 * @returns {Boolean}
 */
export function isSafari() {
    if (isBrowser()) {
        const vendor = navigator.vendor || '',
            userAgent = navigator.userAgent || '';

        return vendor.indexOf('Apple') > -1 && !userAgent.match('CriOS');
    }
    return false;
}

/**
 * @returns {Boolean}
 */
export function isChrome() {
    if (isBrowser()) {
        const vendor = navigator.vendor || '',
            userAgent = navigator.userAgent || '';

        return /Chrome/.test(userAgent) && /Google Inc/.test(vendor);
    }
    return false;
}

/**
 * @returns {Boolean}
 */
export function isMac() {
    if (isBrowser()) {
        const platform = navigator.platform.toLowerCase();
        return !!~platform.indexOf('mac');
    }
    return false;
}

/**
 * @returns {Boolean}
 */
export function isDesktopSafari() {
    return isMac() && isSafari() && !isMobileOrTablet();
}

/**
 * @returns {Boolean}
 */
export function isMacChrome() {
    return isMac() && isChrome();
}
/**
 * @returns {Boolean}
 */
export function  isIE() {
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf('MSIE ');
  var trident = ua.indexOf('Trident/');
  var edge = ua.indexOf('Edge/');

  if (msie > 0 || trident > 0 || edge > 0) {
    return true;
  }

  // other browser
  return false;
}
