import _ from 'lodash';
var isLoadingArray = [];
/**
 * @param relationship
 * @param elements
 * @returns {Object}
 */
export function getRelationshipWithElements(relationship, elements) {
    return _.assign(
        {
            fromElement: getElementById(elements, relationship.fromId),
            toElement: getElementById(elements, relationship.toId)
        },
        relationship
    );
}

/**
 * @param relationships
 * @param elements
 * @param elementId
 * @returns {Array}
 */
export function getRelationshipsWithElements(relationships, elements, elementId) {
    if (elementId) {
        relationships = _.filter(relationships, (relationship) => {
           return relationship.fromId == elementId || relationship.toId == elementId;
        });
    }
    return _.map(relationships, (relationship) => {
       return getRelationshipWithElements(relationship, elements);
    });
}

/**
 * @param elements
 * @param elementId
 * @returns {Object}
 */
export function getElementById(elements, elementId) {
    return _.find(elements, (element) => {
        return element.id == elementId;
    });
}

/**
 * @param elements
 * @param elementId
 * @returns {Object}
 */
export function getPreviousElementById(elements, elementId) {
    const index = _.findIndex(elements, (element) => {
        return element.id == elementId;
    });

    if (index > 0) {
        return elements[index-1];
    }

    return null;
}

/**
 * @param relationships
 * @param relationshipId
 * @returns {Object}
 */
export function getRelationshipById(relationships, relationshipId) {
    return _.find(relationships, (relationship) => {
        return relationship.id == relationshipId;
    });
}

/**
 * @param {Array} relationships
 * @param {String} fromId
 * @param {String} toId
 * @returns {Object}
 */
export function getRelationshipByFromIdAndToId(relationships, fromId, toId) {
    return _.find(relationships, (relationship) => {
        return relationship.fromId == fromId && relationship.toId == toId
            || relationship.toId == toId && relationship.toId == fromId;
    });
}

/**
 *
 * @param {Array} elements
 * @param {String} name
 * @returns {Object}
 */
export function getElementByName(elements, name) {
    return _.find(elements, (element) => {
        return element.name === name;
    });
}

/**
 *
 * @param {Array} relationships
 * @param {Array} elements
 * @param {String} elementId
 * @param {String} name
 * @returns {boolean}
 */
export function getRelationshipByElementIdAndName(relationships, elements, elementId, name) {
    const relationshipsWithElementsById = getRelationshipsWithElements(relationships, elements, elementId);
    return _.find(relationshipsWithElementsById, (relationshipWithElement) => {
        return _.get(relationshipWithElement, 'fromElement.name', {}) === name
            || _.get(relationshipWithElement, 'toElement.name', {}) === name;
    });
}

/**
 * @param {Array} elements
 * @param {Array} relationships
 * @param {Array} elementIds
 * @param {string} name
 * @returns {Array}
 */
export function getSuggestedElements(elements, relationships, elementIds = [], name) {
    _.forEach(relationships, (relationship) => {
        elementIds.push(relationship.fromId);
        elementIds.push(relationship.toId);
    });
    elementIds = _.uniq(elementIds);

    return _.filter(elements, (element) => {
       return !_.includes(elementIds, element.id) && element.name.toLowerCase().indexOf(name.toLowerCase()) >= 0;
    });
}
/**
 * @param metadata
 * @param elementId
 * @returns {Object}
 */
export function getMetadataByElementId(metadata, elementId) {
    return _.find(metadata, (element) => {
        return element.elementId == elementId;
    });
}
export function getUploadProcess() {
  return isLoadingArray;
}

export function setUploadProcess(array) {
  return isLoadingArray = array;
}
/**
 * @param {string} string
 * @returns {string}
 */
export function getNameBetweenBraces(string) {
    var matches = [];
    var pattern = /\[(.*?)\]/g;
    var match;
    while ((match = pattern.exec(string)) != null)
    {
        matches.push(match[1]);
    }
    return (!_.isEmpty(matches[0])) ? matches[0] : 'Untitled Model';
}
/**
 * @param {string} name
 * @returns {string}
 */
export function getTemplateIconName(name) {
    try{
        var iconName = ((!_.isEmpty(name) && !_.isUndefined(name)) && typeof name == "string") ? name.split('|') : '';
        return (iconName != '') ? require("../public/templates/"+iconName[iconName.length - 1]) : "../public/templates/template-default.svg"; 
    }
    catch (exception) {
        return "../public/templates/template-default.svg";
    }
}
