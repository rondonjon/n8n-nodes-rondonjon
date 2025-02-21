import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import { readdirSync } from 'fs';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

const PARAM_PATH = 'path';
const PARAM_DESTINATIONKEY = 'destinationKey';

/**
 * Reads the contents of a local directory, but without importing the binary
 * data of files into the workflow, as the native
 * ["Read/Write Files from Disk"](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.readwritefile)
 * node does, since this can be problematic for large files.
 */
export class ReadDir implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Read Directory',
		name: 'rondonjonReadDir',
		icon: 'file:ReadDir.svg',
		group: ['transform'],
		version: 1,
		description:
			'Reads the contents of a local directory, but without importing the binary data of files into the workflow, as the native n8n node does',
		defaults: {
			name: 'Read Directory',
		},
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [NodeConnectionType.Main],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Path',
				name: PARAM_PATH,
				type: 'string',
				default: '',
				placeholder: '',
				required: true,
				description: 'Path of a directory on the local filesystem',
			},
			{
				displayName: 'Destination Key',
				name: PARAM_DESTINATIONKEY,
				type: 'string',
				default: undefined,
				description:
					'The key to which the directory contents will be written (default: "contents")',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const item = items[itemIndex];

				const path = this.getNodeParameter(PARAM_PATH, itemIndex, '') as string;

				const destinationKey = this.getNodeParameter(
					PARAM_DESTINATIONKEY,
					itemIndex,
					'contents',
				) as string;

				const entries = readdirSync(path, {
					withFileTypes: true,
				}).map((e) => ({
					name: e.name,
					isDirectory: e.isDirectory(),
					isFile: e.isFile(),
				}));

				item.json[destinationKey] = entries;
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
