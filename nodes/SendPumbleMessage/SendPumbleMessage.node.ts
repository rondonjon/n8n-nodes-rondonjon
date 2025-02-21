import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import {
	API_BASE_URL as PUMBLE_API_BASE_URL,
	DOCUMENTATION_URL as PUBMLE_API_DOCUMENTATION_URL,
	NAME as PUMBLE_API_CREDENTIALS_NAME,
	PROPERTY_API_KEY as PUMBLE_API_CREDENTIALS_API_KEY,
} from '../../credentials/PumbleApi.credentials';

const PARAM_CHANNELID = 'channelId';
const PARAM_DESTINATIONKEY = 'destinationKey';
const PARAM_MESSAGEBODY = 'messageBody';
const PARAM_TIMEOUTMILLIS = 'timeoutMillis';

/**
 * Sends a message to a Pumble channel.
 */
export class SendPumbleMessage implements INodeType {
	description: INodeTypeDescription = {
		credentials: [
			{
				name: PUMBLE_API_CREDENTIALS_NAME,
				required: true,
			},
		],
		defaults: {
			name: 'Send Pumble Message',
		},
		displayName: 'Send Pumble Message',
		description: 'Send a message to a Pumble channel',
		documentationUrl: PUBMLE_API_DOCUMENTATION_URL,
		group: ['transform'],
		icon: 'file:SendPumbleMessage.svg',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [NodeConnectionType.Main],
		name: 'rondonjonSendPumbleMessage',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Channel ID',
				name: PARAM_CHANNELID,
				type: 'string',
				default: undefined,
				required: true,
				description: 'ID of the channel to send the message to',
			},
			{
				displayName: 'Message Body',
				name: PARAM_MESSAGEBODY,
				type: 'string',
				default: undefined,
				required: true,
				description: 'Plain-text message to send',
			},
			{
				displayName: 'Destination Key',
				name: PARAM_DESTINATIONKEY,
				type: 'string',
				default: undefined,
				description: 'The key to which the Pumble response will be written (default: "pumble")',
			},
			{
				displayName: 'Timeout',
				name: PARAM_TIMEOUTMILLIS,
				type: 'number',
				default: undefined,
				description:
					'Timeout in milliseconds after which the request will be aborted (default: 5000)',
			},
		],
		version: 1,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const credentials = await this.getCredentials(PUMBLE_API_CREDENTIALS_NAME);
		const apiKey = credentials[PUMBLE_API_CREDENTIALS_API_KEY] as string;
		const items = this.getInputData();

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const item = items[itemIndex];

				const channelId = this.getNodeParameter(PARAM_CHANNELID, itemIndex, '') as string;

				const messageBody = this.getNodeParameter(PARAM_MESSAGEBODY, itemIndex, '') as string;

				const destinationKey = this.getNodeParameter(
					PARAM_DESTINATIONKEY,
					itemIndex,
					'pumble',
				) as string;

				const timeoutMillis = this.getNodeParameter(PARAM_TIMEOUTMILLIS, itemIndex, 5000) as number;

				const timeBefore = Date.now();
				let status: number;
				let statusText: string;

				try {
					const signal = AbortSignal.timeout(timeoutMillis);

					const response = await fetch(new URL('/sendMessage', PUMBLE_API_BASE_URL), {
						method: 'POST',
						headers: {
							'Api-Key': apiKey,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							asBot: true,
							channelId: channelId,
							text: messageBody,
						}),
						signal,
					});

					status = response.status;
					statusText = response.statusText;
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Pumble HTTP request failed: ${error}`);
				}

				if (status !== 200) {
					throw new NodeOperationError(this.getNode(), `Pumble HTTP request failed: ${statusText}`);
				}

				item.json[destinationKey] = {
					durationMillis: Date.now() - timeBefore,
					status,
					statusText,
				};
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
