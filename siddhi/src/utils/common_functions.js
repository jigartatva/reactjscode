export const escapeHtml = (text) => {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}

export const cloudImageURL = "/cloud/image/";
export const cloudMagazineImageURL = "/cloud/magazine/image/";
export const cloudGallaryImageURL = "/cloud/gallary/image/";
export const assetsImagesURL = "/assets/images/";
export const getInlineStyleForLabel = (labelStyleObject) => {
    const inlineStyle = {};
    if (labelStyleObject) {
        inlineStyle["color"] = labelStyleObject.textColor;
        inlineStyle["order"] = labelStyleObject.order;   //order is a css flex property used to define the order of an element relative to the rest of the flexible items inside the same container
        if (labelStyleObject.ghostLabel) {
            inlineStyle["backgroundColor"] = "transparent";
            inlineStyle["border"] = "1px solid " + labelStyleObject.backgroundOrBorderColor;
        }
        else {
            inlineStyle["backgroundColor"] = labelStyleObject.backgroundOrBorderColor;
        }
    }
    return inlineStyle;
}

export const getInlineStyleForButton = (buttonStyleObject) => {
    const inlineStyle = {};
    if (buttonStyleObject) {
        inlineStyle["color"] = buttonStyleObject.textColor;
        inlineStyle["backgroundColor"] = buttonStyleObject.backgroundColor;
    }
    return inlineStyle;
}

export const getGradientStyling = (gradientStyle, direction = 'top') => {
    const inlineStyle = {};
    if (gradientStyle && gradientStyle.start && gradientStyle.end) {
        inlineStyle['background'] = `linear-gradient(to ${direction}, ${gradientStyle.start}, ${gradientStyle.end})`;
    }
    return inlineStyle;
}

export const toMarkup = (content) => {
    var text = content;
    text = text.replace(/[\r\n]+/g, "<br>");
    text = text.replace(/```(.*?)```/g, "<code>$1</code>");
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__(.*?)__/g, "<u>$1</u>");
    text = text.replace(/~~(.*?)~~/g, "<i>$1</i>");
    text = text.replace(/--(.*?)--/g, "<del>$1</del>");
    text = text.replace(/<<(.*?)>>/g, "<a href='$1'>Link</a>");
    text = text.replace(/(?:__|[*#])|\[(.*?)\]\((.*?)\)/gm, "<a href='$2'>$1</a>");
    return text;
}

export const getSortedNewsListings = (newsListingsObj) => {
    var tempNewsItems = [];
    Object.keys(newsListingsObj).map((m) => {   //converting json object to array
        tempNewsItems.push(newsListingsObj[m]);
    });
    tempNewsItems.sort(function (obj1, obj2) {    //sorting the array
        return (new Date(obj2.date)).getTime() - (new Date(obj1.date)).getTime();
    });
    return tempNewsItems;
}