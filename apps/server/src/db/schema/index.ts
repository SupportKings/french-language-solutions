// Export all tables

export * from "./attendance-records";
export * from "./auth";
export * from "./automated-follow-ups";
export * from "./classes";
export * from "./cohorts";
export * from "./enrollments";
// Export all enums
export * from "./enums";
export * from "./language-levels";
export * from "./products";
// Export relations
export * from "./relations";
export * from "./student-assessments";
export * from "./students";
export * from "./teachers";
export * from "./template-follow-up-messages";
export * from "./template-follow-up-sequences";
// Export touchpoints table and enums explicitly to avoid conflicts
export {
	touchpointChannelEnum,
	touchpointSourceEnum,
	touchpoints,
	touchpointTypeEnum,
} from "./touchpoints";
export * from "./weekly-sessions";
