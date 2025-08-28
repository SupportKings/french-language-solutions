// Export all tables
export * from "./auth";
export * from "./teachers";
export * from "./students";
export * from "./products";
export * from "./cohorts";
export * from "./enrollments";
export * from "./weekly-sessions";
export * from "./classes";
export * from "./student-assessments";
export * from "./attendance-records";
export * from "./template-follow-up-sequences";
export * from "./template-follow-up-messages";
export * from "./automated-follow-ups";
export * from "./language-levels";

// Export touchpoints table and enums explicitly to avoid conflicts
export { touchpoints } from "./touchpoints";
export { 
  touchpointChannelEnum,
  touchpointTypeEnum,
  touchpointSourceEnum 
} from "./touchpoints";

// Export all enums
export * from "./enums";

// Export relations
export * from "./relations";