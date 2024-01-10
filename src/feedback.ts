import {
	CompanionFeedbackDefinition,
	CompanionFeedbackDefinitions,
	combineRgb,
	InstanceBase,
} from '@companion-module/base'
import { Vpro8Config } from './config'
import { matrixnames, Vpro8State } from './state'
import { getInputChoices } from './choices'
import { EmberClient } from 'node-emberplus/lib/client/ember-client'

export enum FeedbackId {
	Take = 'take',
	Clear = 'clear',
	Undo = 'undo',
	SelectedSourceVideo = 'selected_source_video',
	SelectedSourceAudio = 'selected_source_audio',
	SelectedSourceVideoQuad = 'selected_source_video_quad',
	SelectedSourceAudioQuad = 'selected_source_audio_quad',
	SelectedTargetVideo = 'selected_target_video',
	SelectedTargetAudio = 'selected_target_audio',
	SelectedTargetVideoQuad = 'selected_target_video_quad',
	SelectedTargetAudioQuad = 'selected_target_audio_quad',
	TakeTallySourceVideo = 'take_tally_source_video',
	TakeTallySourceAudio = 'take_tally_source_audio',
	TakeTallySourceVideoQuad = 'take_tally_source_video_quad',
	TakeTallySourceAudioQuad = 'take_tally_source_audio_quad',
}

/**
 * Returns all implemented Feedbacks.
 * @param _self reference to the BaseInstance
 * @param _emberClient reference to the emberClient
 * @param state reference to the state of the module
 * @constructor
 */

export function GetFeedbacksList(
	_self: InstanceBase<Vpro8Config>,
	_emberClient: EmberClient,
	state: Vpro8State
): CompanionFeedbackDefinitions {
	const { inputChoices, outputChoices } = getInputChoices(state)
	const feedbacks: { [id in FeedbackId]: CompanionFeedbackDefinition | undefined } = {
		[FeedbackId.Take]: {
			name: 'Take is possible',
			description: 'Shows if there is take possible',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 255, 255),
				color: combineRgb(255, 0, 0),
			},
			options: [],
			callback: () => {
				return (
					state.selected.target != -1 &&
					state.selected.source != -1 &&
					state.selected.matrix != -1 &&
					state.selected.source != state.matrices[state.selected.matrix].outputs[state.selected.target].route
				)
			},
		},
		[FeedbackId.Clear]: {
			name: 'Clear is possible',
			description: 'Changes when a selection is made.',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 255, 255),
				color: combineRgb(255, 0, 0),
			},
			options: [],
			callback: () => {
				return state.selected.target != -1 || state.selected.source != -1 || state.selected.matrix != -1
			},
		},
		[FeedbackId.Undo]: {
			name: 'True if undo possible',
			description: 'Changes Style if undo is possible on current target',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(0, 0, 255),
				color: combineRgb(0, 0, 0),
			},
			options: [],
			callback: () => {
				if (state.selected.matrix != -1 && state.selected.target != -1) {
					const selOut = state.matrices[state.selected.matrix].outputs[state.selected.target]
					return selOut.fallback[selOut.fallback.length - 2] != undefined
				} else return false
			},
		},
		[FeedbackId.SelectedSourceVideo]: {
			name: 'Video Source Background If Selected',
			description: 'Change Background of Source, when it is currently selected.',
			type: 'boolean',
			defaultStyle: {
				// The default style change for a boolean feedback
				// The user will be able to customise these values as well as the fields that will be changed
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
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
			callback: (feedback) => {
				return state.selected.source == feedback.options['source'] && state.selected.matrix == matrixnames.video
			},
		},
		[FeedbackId.SelectedSourceAudio]: {
			name: 'Audio Source Background If Selected',
			description: 'Change Background of Source, when it is currently selected.',
			type: 'boolean',
			defaultStyle: {
				// The default style change for a boolean feedback
				// The user will be able to customise these values as well as the fields that will be changed
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
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
			callback: (feedback) => {
				return state.selected.source == feedback.options['source'] && state.selected.matrix == matrixnames.audio
			},
		},
		[FeedbackId.SelectedSourceVideoQuad]: {
			name: 'Data Source Background If Selected',
			description: 'Change Background of Source, when it is currently selected.',
			type: 'boolean',
			defaultStyle: {
				// The default style change for a boolean feedback
				// The user will be able to customise these values as well as the fields that will be changed
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
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
			callback: (feedback) => {
				return state.selected.source == feedback.options['source'] && state.selected.matrix == matrixnames.videoQuad
			},
		},
		[FeedbackId.SelectedSourceAudioQuad]: {
			name: 'MChAudio Source Background If Selected',
			description: 'Change Background of Source, when it is currently selected.',
			type: 'boolean',
			defaultStyle: {
				// The default style change for a boolean feedback
				// The user will be able to customise these values as well as the fields that will be changed
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
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
			callback: (feedback) => {
				return state.selected.source == feedback.options['source'] && state.selected.matrix == matrixnames.audioQuad
			},
		},
		[FeedbackId.SelectedTargetVideo]: {
			name: 'Video Target Background if Selected',
			description: 'Change Background of Target, when it is currently selected.',
			type: 'boolean',
			defaultStyle: {
				// The default style change for a boolean feedback
				// The user will be able to customise these values as well as the fields that will be changed
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
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
			callback: (feedback) => {
				return state.selected.target == feedback.options['target'] && state.selected.matrix == matrixnames.video
			},
		},
		[FeedbackId.SelectedTargetAudio]: {
			name: 'Audio Target Background if Selected',
			description: 'Change Background of Target, when it is currently selected.',
			type: 'boolean',
			defaultStyle: {
				// The default style change for a boolean feedback
				// The user will be able to customise these values as well as the fields that will be changed
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
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
			callback: (feedback) => {
				return state.selected.target == feedback.options['target'] && state.selected.matrix == matrixnames.audio
			},
		},
		[FeedbackId.SelectedTargetVideoQuad]: {
			name: 'Data Target Background if Selected',
			description: 'Change Background of Target, when it is currently selected.',
			type: 'boolean',
			defaultStyle: {
				// The default style change for a boolean feedback
				// The user will be able to customise these values as well as the fields that will be changed
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
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
			callback: (feedback) => {
				return state.selected.target == feedback.options['target'] && state.selected.matrix == matrixnames.videoQuad
			},
		},
		[FeedbackId.SelectedTargetAudioQuad]: {
			name: 'MChAudio Target Background if Selected',
			description: 'Change Background of Target, when it is currently selected.',
			type: 'boolean',
			defaultStyle: {
				// The default style change for a boolean feedback
				// The user will be able to customise these values as well as the fields that will be changed
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
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
			callback: (feedback) => {
				return state.selected.target == feedback.options['target'] && state.selected.matrix == matrixnames.audioQuad
			},
		},
		[FeedbackId.TakeTallySourceVideo]: {
			name: 'Video Source Background if routed on selected Target',
			description: 'Change Background of Source, when it is currently routed on the selected target.',
			type: 'boolean',
			defaultStyle: {
				// The default style change for a boolean feedback
				// The user will be able to customise these values as well as the fields that will be changed
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
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
			callback: (feedback) => {
				if (
					state.selected.matrix !== matrixnames.video ||
					state.matrices[state.selected.matrix].outputs == undefined ||
					state.matrices[state.selected.matrix].outputs[state.selected.target] == undefined ||
					state.matrices[state.selected.matrix].outputs[state.selected.target].route == undefined
				)
					return false
				return feedback.options['source'] == state.matrices[state.selected.matrix].outputs[state.selected.target].route
			},
		},
		[FeedbackId.TakeTallySourceAudio]: {
			name: 'Audio Source Background if routed on selected Target',
			description: 'Change Background of Source, when it is currently routed on the selected target.',
			type: 'boolean',
			defaultStyle: {
				// The default style change for a boolean feedback
				// The user will be able to customise these values as well as the fields that will be changed
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
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
			callback: (feedback) => {
				if (
					state.selected.matrix !== matrixnames.audio ||
					state.matrices[state.selected.matrix].outputs == undefined ||
					state.matrices[state.selected.matrix].outputs[state.selected.target] == undefined ||
					state.matrices[state.selected.matrix].outputs[state.selected.target].route == undefined
				)
					return false
				return feedback.options['source'] == state.matrices[state.selected.matrix].outputs[state.selected.target].route
			},
		},
		[FeedbackId.TakeTallySourceVideoQuad]: {
			name: 'Data Source Background if routed on selected Target',
			description: 'Change Background of Source, when it is currently routed on the selected target.',
			type: 'boolean',
			defaultStyle: {
				// The default style change for a boolean feedback
				// The user will be able to customise these values as well as the fields that will be changed
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
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
			callback: (feedback) => {
				if (
					state.selected.matrix !== matrixnames.videoQuad ||
					state.matrices[state.selected.matrix].outputs == undefined ||
					state.matrices[state.selected.matrix].outputs[state.selected.target] == undefined ||
					state.matrices[state.selected.matrix].outputs[state.selected.target].route == undefined
				)
					return false
				return feedback.options['source'] == state.matrices[state.selected.matrix].outputs[state.selected.target].route
			},
		},
		[FeedbackId.TakeTallySourceAudioQuad]: {
			name: 'MChAudio Source Background if routed on selected Target',
			description: 'Change Background of Source, when it is currently routed on the selected target.',
			type: 'boolean',
			defaultStyle: {
				// The default style change for a boolean feedback
				// The user will be able to customise these values as well as the fields that will be changed
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
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
			callback: (feedback) => {
				if (
					state.selected.matrix !== matrixnames.audioQuad ||
					state.matrices[state.selected.matrix].outputs == undefined ||
					state.matrices[state.selected.matrix].outputs[state.selected.target] == undefined ||
					state.matrices[state.selected.matrix].outputs[state.selected.target].route == undefined
				)
					return false
				return feedback.options['source'] == state.matrices[state.selected.matrix].outputs[state.selected.target].route
			},
		},
	}

	return feedbacks
}
