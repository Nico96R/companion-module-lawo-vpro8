import {
	CompanionActionDefinition,
	CompanionActionDefinitions,
	CompanionActionEvent,
	InstanceBase,
} from '@companion-module/base'
import { Vpro8Config } from './config'
import { FeedbackId } from './feedback'
import { matrixnames, Vpro8State } from './state'
import { getInputChoices } from './choices'
import { updateSelectedTargetVariables } from './variables'
import { EmberClient } from 'node-emberplus/lib/client/ember-client'
import { QualifiedMatrix } from 'node-emberplus/lib/common/matrix/qualified-matrix'

export enum ActionId {
	Take = 'take',
	Clear = 'clear',
	Undo = 'undo',
	SetSourceVideo = 'select_source_video',
	SetTargetVideo = 'select_target_video',
	SetSourceAudio = 'select_source_audio',
	SetTargetAudio = 'select_target_audio',
	SetSourceVideoQuad = 'select_source_video_quad',
	SetTargetVideoQuad = 'select_target_video_quad',
	SetSourceAudioQuad = 'select_source_audio_quad',
	SetTargetAudioQuad = 'select_target_audio_quad',
}

/**
 * Performes a connection on a specified matrix.
 * @param self reference to the BaseInstance
 * @param emberClient reference to the emberClient
 * @param state reference to the state of the module
 */
const doMatrixActionFunction = function (self: InstanceBase<Vpro8Config>, emberClient: EmberClient, state: Vpro8State) {
	if (state.selected.source !== -1 && state.selected.target !== -1 && state.selected.matrix !== -1) {
		self.log('debug', 'Get node ' + state.matrices[state.selected.matrix].label + ' matrix')
		emberClient
			.getElementByPathAsync(state.matrices[state.selected.matrix].path)
			.then((node) => {
				if (node && node instanceof QualifiedMatrix) {
					self.log('debug', 'Got node on ' + state.matrices[state.selected.matrix].label)
					const target = state.selected.target
					const sources = [state.selected.source]
					emberClient
						.matrixConnectAsync(node, target, sources)
						.then(() => self.log('debug', 'send ok: '))
						.catch((r) => self.log('debug', r))
				} else {
					self.log(
						'warn',
						'Matrix ' +
							state.matrices[state.selected.matrix].label +
							' on ' +
							state.matrices[state.selected.matrix].path +
							' not found.'
					)
				}
			})
			.catch((reason) => self.log('error', reason))
			.finally(() => {
				state.selected.matrix = state.selected.source = state.selected.target = -1

				self.checkFeedbacks(
					FeedbackId.SelectedTargetVideo,
					FeedbackId.SelectedTargetAudio,
					FeedbackId.SelectedTargetVideoQuad,
					FeedbackId.SelectedTargetAudioQuad,
					FeedbackId.TakeTallySourceVideo,
					FeedbackId.TakeTallySourceAudio,
					FeedbackId.TakeTallySourceVideoQuad,
					FeedbackId.TakeTallySourceAudioQuad,
					FeedbackId.SelectedSourceVideo,
					FeedbackId.SelectedSourceAudio,
					FeedbackId.SelectedSourceVideoQuad,
					FeedbackId.SelectedSourceAudioQuad,
					FeedbackId.Take,
					FeedbackId.Clear,
					FeedbackId.Undo
				)

				updateSelectedTargetVariables(self, state)
			})
	}
}

/**
 * Gets called, wenn take is not on Auto-Take.
 * Performes a connect on the wanted matrix
 * @param self reference to the BaseInstance
 * @param emberClient reference to the emberClient
 * @param state reference to the state of the module
 */
const doTake =
	(self: InstanceBase<Vpro8Config>, emberClient: EmberClient, state: Vpro8State) =>
	(action: CompanionActionEvent): void => {
		if (state.selected.target !== -1 && state.selected.source !== -1 && state.selected.matrix !== -1) {
			self.log(
				'debug',
				'TAKE: selectedDest: ' +
					state.selected.target +
					' selected.source: ' +
					state.selected.source +
					' on matrix ' +
					Number(action.options['matrix'])
			)
			doMatrixActionFunction(self, emberClient, state)
		} else {
			self.log('debug', 'TAKE went wrong.')
		}
	}

/**
 * Clear the current selected Source and Target
 * @param self reference to the BaseInstance
 * @param state reference to the modules state
 */
const doClear = (self: InstanceBase<Vpro8Config>, state: Vpro8State) => (): void => {
	state.selected.matrix = state.selected.source = state.selected.target = -1
	self.checkFeedbacks(
		FeedbackId.SelectedTargetVideo,
		FeedbackId.SelectedTargetAudio,
		FeedbackId.SelectedTargetVideoQuad,
		FeedbackId.SelectedTargetAudioQuad,
		FeedbackId.TakeTallySourceVideo,
		FeedbackId.TakeTallySourceAudio,
		FeedbackId.TakeTallySourceVideoQuad,
		FeedbackId.TakeTallySourceAudioQuad,
		FeedbackId.SelectedSourceVideo,
		FeedbackId.SelectedSourceAudio,
		FeedbackId.SelectedSourceVideoQuad,
		FeedbackId.SelectedSourceAudioQuad,
		FeedbackId.Take,
		FeedbackId.Clear,
		FeedbackId.Undo
	)
	updateSelectedTargetVariables(self, state)
}

const doUndo = (self: InstanceBase<Vpro8Config>, emberClient: EmberClient, state: Vpro8State) => (): void => {
	const selOut = state.matrices[state.selected.matrix].outputs[state.selected.target]
	if (selOut.fallback[selOut.fallback.length - 2] != undefined) {
		selOut.fallback.pop()
		state.selected.source = selOut.fallback.pop() ?? -1
		doMatrixActionFunction(self, emberClient, state)
		self.checkFeedbacks(
			FeedbackId.SelectedTargetVideo,
			FeedbackId.SelectedTargetAudio,
			FeedbackId.SelectedTargetVideoQuad,
			FeedbackId.SelectedTargetAudioQuad,
			FeedbackId.TakeTallySourceVideo,
			FeedbackId.TakeTallySourceAudio,
			FeedbackId.TakeTallySourceVideoQuad,
			FeedbackId.TakeTallySourceAudioQuad,
			FeedbackId.SelectedSourceVideo,
			FeedbackId.SelectedSourceAudio,
			FeedbackId.SelectedSourceVideoQuad,
			FeedbackId.SelectedSourceAudioQuad,
			FeedbackId.Take,
			FeedbackId.Clear,
			FeedbackId.Undo
		)
	}
}

/**
 * Selects a source on a specific matrix.
 * When Auto-Take is enabled the source is routed to the selected target.
 * @param self reference to the BaseInstance
 * @param emberClient reference to the emberClient
 * @param config reference to the config of the module
 * @param state reference to the state of the module
 * @param matrix number of the wanted matrix
 */
const setSelectedSource =
	(self: InstanceBase<Vpro8Config>, emberClient: EmberClient, config: Vpro8Config, state: Vpro8State, matrix: number) =>
	(action: CompanionActionEvent): void => {
		if (action.options['source'] != -1 && matrix == state.selected.matrix) {
			state.selected.source = Number(action.options['source'])
			self.log('debug', 'Take is: ' + config.take)
			if (config.take) doMatrixActionFunction(self, emberClient, state)
			self.checkFeedbacks(
				FeedbackId.SelectedSourceVideo,
				FeedbackId.SelectedSourceAudio,
				FeedbackId.SelectedSourceVideoQuad,
				FeedbackId.SelectedSourceAudioQuad,
				FeedbackId.Take,
				FeedbackId.Clear
			)

			updateSelectedTargetVariables(self, state)
			self.log(
				'debug',
				'setSelectedSource: ' + action.options['source'] + ' on Matrix: ' + state.matrices[matrix].label
			)
		}
	}

/**
 * Selects a target on a specified matrix.
 * @param self reference to the BaseInstance
 * @param state reference to the state of the module
 * @param matrix number of the wanted matrix
 */
const setSelectedTarget =
	(self: InstanceBase<Vpro8Config>, state: Vpro8State, matrix: number) =>
	(action: CompanionActionEvent): void => {
		if (action.options['target'] != -1) {
			state.selected.target = Number(action.options['target'])
			state.selected.matrix = matrix
		}
		state.selected.source = -1

		self.checkFeedbacks(
			FeedbackId.SelectedTargetVideo,
			FeedbackId.SelectedTargetAudio,
			FeedbackId.SelectedTargetVideoQuad,
			FeedbackId.SelectedTargetAudioQuad,
			FeedbackId.TakeTallySourceVideo,
			FeedbackId.TakeTallySourceAudio,
			FeedbackId.TakeTallySourceVideoQuad,
			FeedbackId.TakeTallySourceAudioQuad,
			FeedbackId.SelectedSourceVideo,
			FeedbackId.SelectedSourceAudio,
			FeedbackId.SelectedSourceVideoQuad,
			FeedbackId.SelectedSourceAudioQuad,
			FeedbackId.Take,
			FeedbackId.Clear,
			FeedbackId.Undo
		)
		updateSelectedTargetVariables(self, state)
		self.log('debug', 'setSelectedTarget: ' + action.options['target'] + ' on Matrix: ' + state.matrices[matrix].label)
	}

/**
 * Returns all implemented actions.
 * @param self reference to the BaseInstance
 * @param emberClient reference to the emberClient
 * @param config reference to the config of the module
 * @param state reference to the state of the module
 * @constructor
 */
export function GetActionsList(
	self: InstanceBase<Vpro8Config>,
	emberClient: EmberClient,
	config: Vpro8Config,
	state: Vpro8State
): CompanionActionDefinitions {
	const { inputChoices, outputChoices } = getInputChoices(state)

	const actions: { [id in ActionId]: CompanionActionDefinition | undefined } = {
		[ActionId.Take]: {
			name: 'Take',
			options: [],
			callback: doTake(self, emberClient, state),
		},
		[ActionId.Clear]: {
			name: 'Clear',
			options: [],
			callback: doClear(self, state),
		},
		[ActionId.Undo]: {
			name: 'Undo',
			options: [],
			callback: doUndo(self, emberClient, state),
		},
		[ActionId.SetSourceVideo]: {
			name: 'Select Video Source',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'source',
					default: 0,
					minChoicesForSearch: 10,
					choices: inputChoices[matrixnames.video],
				},
			],
			callback: setSelectedSource(self, emberClient, config, state, matrixnames.video),
		},
		[ActionId.SetTargetVideo]: {
			name: 'Select Video Target',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'target',
					default: 0,
					minChoicesForSearch: 10,
					choices: outputChoices[matrixnames.video],
				},
			],
			callback: setSelectedTarget(self, state, matrixnames.video),
		},
		[ActionId.SetSourceAudio]: {
			name: 'Select Audio Source',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'source',
					default: 0,
					minChoicesForSearch: 10,
					choices: inputChoices[matrixnames.audio],
				},
			],
			callback: setSelectedSource(self, emberClient, config, state, matrixnames.audio),
		},
		[ActionId.SetTargetAudio]: {
			name: 'Select Audio Target',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'target',
					default: 0,
					minChoicesForSearch: 10,
					choices: outputChoices[matrixnames.audio],
				},
			],
			callback: setSelectedTarget(self, state, matrixnames.audio),
		},
		[ActionId.SetSourceVideoQuad]: {
			name: 'Select Video Quad Source',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'source',
					default: 0,
					minChoicesForSearch: 10,
					choices: inputChoices[matrixnames.videoQuad],
				},
			],
			callback: setSelectedSource(self, emberClient, config, state, matrixnames.videoQuad),
		},
		[ActionId.SetTargetVideoQuad]: {
			name: 'Select Video Quad Target',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'target',
					default: 0,
					minChoicesForSearch: 10,
					choices: outputChoices[matrixnames.videoQuad],
				},
			],
			callback: setSelectedTarget(self, state, matrixnames.videoQuad),
		},
		[ActionId.SetSourceAudioQuad]: {
			name: 'Select Audio Quad Source',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'source',
					default: 0,
					minChoicesForSearch: 10,
					choices: inputChoices[matrixnames.audioQuad],
				},
			],
			callback: setSelectedSource(self, emberClient, config, state, matrixnames.audioQuad),
		},
		[ActionId.SetTargetAudioQuad]: {
			name: 'Select Audio Quad Target',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'target',
					default: 0,
					minChoicesForSearch: 10,
					choices: outputChoices[matrixnames.audioQuad],
				},
			],
			callback: setSelectedTarget(self, state, matrixnames.audioQuad),
		},
	}

	return actions
}
