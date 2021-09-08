// TODO: suggestions

/**
 * @type {import('eslint').Rule.RuleModule}
 */
const rule = {
    create(context) {
        /**
         * @type {string[]}
         */
        const knownIds = [];

        return {
            VariableDeclaration(node) {
                /**
                 *
                 * @param {import('estree').ObjectExpression['properties'][number]} property
                 * @returns {property is import('estree').Property & { key: import('estree').Identifier }}
                 */
                const isEntriesProperty = property =>
                    property.type === 'Property' &&
                    property.key.type === 'Identifier' &&
                    property.key.name === 'entries';
                /**
                 *
                 * @param {import('estree').ObjectExpression['properties'][number]} property
                 * @returns {property is import('estree').Property & { key: import('estree').Literal }}
                 */
                const hasLiteralKey = property => property.type === 'Property' && property.key.type === 'Literal';

                const init = node.declarations[0].init;
                if (init?.type === 'ObjectExpression') {
                    const objectExpression = init.properties.find(isEntriesProperty)?.value;
                    if (objectExpression?.type === 'ObjectExpression') {
                        objectExpression.properties.filter(hasLiteralKey).forEach(property => {
                            knownIds.push(property.key.value);
                            if (property.value.type !== 'ObjectExpression') {
                                context.report({
                                    node,
                                    messageId: 'entryNotObject',
                                    data: {
                                        id: property.key.value,
                                        type: property.value.type
                                    }
                                });
                            } else {
                                const idProperty = property.value.properties.find(
                                    property =>
                                        property.type === 'Property' &&
                                        property.key.type === 'Identifier' &&
                                        property.key.name === 'id'
                                );

                                if (!idProperty) {
                                    context.report({
                                        node,
                                        messageId: 'entryNoId',
                                        data: {
                                            key: property.key.value
                                        }
                                    });
                                } else if (
                                    idProperty.value.type !== 'Literal' ||
                                    idProperty.value.value !== property.key.value
                                ) {
                                    context.report({
                                        node: idProperty,
                                        messageId: 'entryIdInvalid',
                                        data: {
                                            id:
                                                idProperty.value.type !== 'Literal'
                                                    ? idProperty.value.type
                                                    : JSON.stringify(idProperty.value.value),
                                            key: property.key.value
                                        }
                                    });
                                }
                            }
                        });
                        return;
                    }
                }
                context.report({
                    node,
                    messageId: 'noValidEntries'
                });
            },
            Property(node) {
                if (
                    node.key.type !== 'Identifier' ||
                    !['subEntries', 'mainEntries'].includes(node.key.name) ||
                    node.value.type !== 'ArrayExpression'
                ) {
                    return;
                }

                node.value.elements.forEach(element => {
                    if (element.type !== 'Literal' || typeof element.value !== 'string') {
                        context.report({
                            node: element,
                            messageId: 'nonLiteral',
                            data: {}
                        });
                    } else if (!knownIds.includes(element.value)) {
                        context.report({
                            node: element,
                            messageId: 'unknownId',
                            data: { id: element.value }
                        });
                    }
                });
            }
        };
    },
    meta: {
        docs: {
            category: 'Possible Errors',
            description: "Don't allow undefined IDs"
        },
        messages: {
            entryIdInvalid: 'entry under key {{ key }} has invalid id, got {{ id }}, must be literal string {{ key }}',
            entryNoId: 'entry under key {{ key }} is invalid, has no id set',
            entryNotObject: 'entry of id {{ id }} must be an object, got {{ type }}',
            nonLiteral: 'IDs need to be literals',
            noValidEntries: 'No valid `entries` key found in root of object',
            unknownId: 'Entry of id {{ id }} has not been defined'
        },
        schema: [],
        type: 'problem'
    }
};
module.exports = rule;
