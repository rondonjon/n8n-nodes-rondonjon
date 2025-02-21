import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { JSDOM } from 'jsdom';
import DomPurify from 'dompurify';

const PARAM_HTML = 'html';
const PARAM_DESTINATIONKEY = 'destinationKey';

/**
 * Sanitizes a given HTML string
 */
export class SanitizeHtml implements INodeType {
	description: INodeTypeDescription = {
		defaults: {
			name: 'Sanitize HTML',
		},
		displayName: 'Sanitize HTML',
		description: 'Sanitizes a given HTML string',
		group: ['transform'],
		icon: 'file:SanitizeHtml.svg',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [NodeConnectionType.Main],
		name: 'rondonjonSanitizeHtml',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'HTML',
				name: PARAM_HTML,
				type: 'string',
				default: undefined,
				required: true,
				description: 'The HTML string that will be sanitized',
			},
			{
				displayName: 'Destination Key',
				name: PARAM_DESTINATIONKEY,
				type: 'string',
				default: undefined,
				description:
					'The key to which the sanitized HTML will be written (default: "sanitizedHtml")',
			},
		],
		version: 1,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const item = items[itemIndex];
				const window = new JSDOM('').window;

				const html = this.getNodeParameter(PARAM_HTML, itemIndex, '') as string;

				const sanitizedHtml = DomPurify(window).sanitize(html, {
					USE_PROFILES: {
						html: true,
					},
				});

				const destinationKey = this.getNodeParameter(
					PARAM_DESTINATIONKEY,
					itemIndex,
					'sanitizedHtml',
				) as string;

				item.json[destinationKey] = sanitizedHtml;
			} catch (error) {
				if (this.continueOnFail()) {
					items.push({
						json: this.getInputData(itemIndex)[0].json,
						error,
						pairedItem: itemIndex,
					});
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [items];
	}
}
