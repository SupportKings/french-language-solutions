import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";


//ALL OPTIONS
export const statement = {
    ...defaultStatements,

//user management
    user: ["create", "list", "set-role", "ban", "impersonate", "delete", "set-password", "update"],
    
    // Client Management
    clients: ["read", "write", "activation_checklist_read", "activation_checklist_write", "nps_read", "nps_write", "wins_read", "wins_write", "testimonials_read", "testimonials_write", "status_read", "status_write", "onboarding_read", "onboarding_write", "offboarding_read", "offboarding_write", "assignments_read", "assignments_write", "history_read", "call_feedback_read", "plan_dates_write"],
    
    // Coach Management
    coaches: ["read", "write", "onboarding_read", "onboarding_write", "capacity_read", "capacity_write", "assignments_read", "assignments_write", "kpis_read", "status_write"],
    
    // Ticket Management
    tickets: ["read", "write", "create", "reassign", "executive_read", "reminders_write"],
    
    // Billing Management
    billing: ["read", "write", "transactions_read", "payment_plans_read", "payment_plans_write", "cash_collection_read", "renewals_read", "churn_read", "coach_costs_read", "coach_costs_write", "amount_owed_read", "terms_write"],
    
    // Analytics & Reporting
    analytics: ["read", "forecasting_read", "cohort_read", "win_tags_read", "activity_read"],
    
    // System Configuration
    system: ["configure", "churn_rate_configure", "activation_dropoff_configure"],
} as const;

export const ac = createAccessControl(statement);

//default user role
export const user = ac.newRole({
	// Basic user permissions - minimal access
	clients: ["read"],
	analytics: ["read"],
	user: ["list"], // Allow users to list other users
});

// Admin role
export const admin = ac.newRole({

	// ALL PERMISSIONS - Admin has unrestricted access to all system functions
	clients: ["read", "write", "activation_checklist_read", "activation_checklist_write", "nps_read", "nps_write", "wins_read", "wins_write", "testimonials_read", "testimonials_write", "status_read", "status_write", "onboarding_read", "onboarding_write", "offboarding_read", "offboarding_write", "assignments_read", "assignments_write", "history_read", "call_feedback_read", "plan_dates_write"],
	coaches: ["read", "write", "onboarding_read", "onboarding_write", "capacity_read", "capacity_write", "assignments_read", "assignments_write", "kpis_read", "status_write"],
	tickets: ["read", "write", "create", "reassign", "executive_read", "reminders_write"],
	billing: ["read", "write", "transactions_read", "payment_plans_read", "payment_plans_write", "cash_collection_read", "renewals_read", "churn_read", "coach_costs_read", "coach_costs_write", "amount_owed_read", "terms_write"],
	analytics: ["read", "forecasting_read", "cohort_read", "win_tags_read", "activity_read"],
	system: ["configure", "churn_rate_configure", "activation_dropoff_configure"],
	...adminAc.statements, 
});

// Coach role
export const coach = ac.newRole({

	// Basic client management and support
	clients: ["read", "write", "nps_read", "nps_write", "wins_read", "wins_write", "testimonials_read", "testimonials_write", "status_read", "status_write", "offboarding_read", "offboarding_write", "assignments_read", "history_read"],
	coaches: ["assignments_read", "status_write"],
	tickets: ["read", "write", "create", "reminders_write"],
	analytics: ["read", "win_tags_read", "activity_read"],
	user: ["list"], // Allow coaches to list users
});

// Premiere Coach role
export const premiereCoach = ac.newRole({

	// All Coach permissions plus advanced features
	clients: ["read", "write", "activation_checklist_read", "nps_read", "nps_write", "wins_read", "wins_write", "testimonials_read", "testimonials_write", "status_read", "status_write", "onboarding_read", "offboarding_read", "offboarding_write", "assignments_read", "assignments_write", "history_read", "call_feedback_read"],
	coaches: ["read", "write", "onboarding_read", "onboarding_write", "capacity_read", "capacity_write", "assignments_read", "assignments_write", "kpis_read", "status_write"],
	tickets: ["read", "write", "create", "reassign", "reminders_write"],
	analytics: ["read", "forecasting_read", "cohort_read", "win_tags_read", "activity_read"],
	system: ["churn_rate_configure", "activation_dropoff_configure"],
	user: ["list"], // Allow premiere coaches to list users
});

// CPO (Chief Product Officer) role
export const cpo = ac.newRole({

	// All Premiere Coach permissions plus executive access
	clients: ["read", "write", "activation_checklist_read", "nps_read", "nps_write", "wins_read", "wins_write", "testimonials_read", "testimonials_write", "status_read", "status_write", "onboarding_read", "offboarding_read", "offboarding_write", "assignments_read", "assignments_write", "history_read", "call_feedback_read", "plan_dates_write"],
	coaches: ["read", "write", "onboarding_read", "onboarding_write", "capacity_read", "capacity_write", "assignments_read", "assignments_write", "kpis_read", "status_write"],
	tickets: ["read", "write", "create", "reassign", "executive_read", "reminders_write"],
	billing: ["read"],
	analytics: ["read", "forecasting_read", "cohort_read", "win_tags_read", "activity_read"],
	system: ["churn_rate_configure", "activation_dropoff_configure"],
	user: ["list"], // Allow CPOs to list users
});

// CS Manager (Customer Success Manager) role
export const csManager = ac.newRole({

	// All Coach permissions plus management features
	clients: ["read", "write", "activation_checklist_read", "nps_read", "nps_write", "wins_read", "wins_write", "testimonials_read", "testimonials_write", "status_read", "status_write", "onboarding_read", "onboarding_write", "offboarding_read", "offboarding_write", "assignments_read", "assignments_write", "history_read", "call_feedback_read", "plan_dates_write"],
	coaches: ["read", "write", "capacity_read", "capacity_write", "assignments_read", "assignments_write", "kpis_read"],
	tickets: ["read", "write", "create", "reassign", "executive_read", "reminders_write"],
	billing: ["read"],
	analytics: ["read", "forecasting_read", "cohort_read", "win_tags_read", "activity_read"],
	system: ["churn_rate_configure", "activation_dropoff_configure"],
	user: ["list"], // Allow CS Managers to list users
});

// CS Rep (Customer Success Representative) role
export const csRep = ac.newRole({

	// Onboarding and client support focused
	clients: ["read", "write", "activation_checklist_read", "activation_checklist_write", "nps_read", "wins_read", "wins_write", "status_read", "status_write", "onboarding_read", "onboarding_write", "history_read"],
	tickets: ["read", "write", "create", "reminders_write"],
	billing: ["payment_plans_read", "payment_plans_write", "terms_write"],
	analytics: ["read", "win_tags_read", "activity_read"],
	user: ["list"], // Allow CS Reps to list users
});

// CSC (Customer Success Coordinator) role
export const csc = ac.newRole({

	// Client status coordination focused
	clients: ["read", "write", "nps_read", "wins_read", "wins_write", "status_read", "status_write", "onboarding_write", "offboarding_read", "offboarding_write", "assignments_read", "history_read"],
	tickets: ["read", "write", "create", "reassign", "reminders_write"],
	analytics: ["read", "win_tags_read", "activity_read"],
	user: ["list"], // Allow CSCs to list users
});

// Finance role
export const finance = ac.newRole({

	// Financial analysis and reporting focused
	clients: ["read", "status_read"],
	tickets: ["read", "write", "create", "reminders_write"],
	billing: ["read", "write", "transactions_read", "payment_plans_read", "cash_collection_read", "renewals_read", "churn_read", "coach_costs_read", "coach_costs_write", "amount_owed_read"],
	analytics: ["read"],
	user: ["list"], // Allow Finance users to list users
});

// Billing Admin role
export const billingAdmin = ac.newRole({

	// All Finance permissions plus billing management
	clients: ["read", "status_read", "plan_dates_write", "onboarding_write"],
	tickets: ["read", "write", "create", "reminders_write"],
	billing: ["read", "write", "transactions_read", "payment_plans_read", "payment_plans_write", "cash_collection_read", "renewals_read", "churn_read", "coach_costs_read", "coach_costs_write", "amount_owed_read", "terms_write"],
	analytics: ["read"],
	user: ["list"], // Allow Billing Admins to list users
});

// Sales Rep role
export const salesRep = ac.newRole({

	// Client acquisition and engagement focused
	clients: ["read", "write", "nps_read", "wins_read", "wins_write", "status_read", "status_write", "history_read"],
	tickets: ["read", "write", "create", "reminders_write"],
	analytics: ["read", "win_tags_read", "activity_read"],
	user: ["list"], // Allow Sales Reps to list users
});

export const rolesMap = { 
    user, 
    admin, 
    coach, 
    premiereCoach, 
    cpo, 
    csManager, 
    csRep, 
    csc, 
    finance, 
    billingAdmin, 
    salesRep 
} as const;




//FOR DEV

// Map of role keys to their display names
export const roleDisplayNames = {
    user: "User",
    admin: "Administrator",
    coach: "Coach",
    premiereCoach: "Premier Coach",
    cpo: "Chief Product Officer",
    csManager: "CS Manager",
    csRep: "CS Representative",
    csc: "CS Coordinator",
    finance: "Finance",
    billingAdmin: "Billing Admin",
    salesRep: "Sales Representative"
} as const;

// Type-safe permissions type inferred from role statements
export type PermissionStatements = typeof admin.statements;

// All possible permission values (extracted from the statement object)
type PermissionValues = 
  | "create" | "list" | "set-role" | "ban" | "impersonate" | "delete" | "set-password" | "update" | "revoke"
  | "read" | "write" | "activation_checklist_read" | "activation_checklist_write" | "nps_read" | "nps_write" 
  | "wins_read" | "wins_write" | "testimonials_read" | "testimonials_write" | "status_read" | "status_write" 
  | "onboarding_read" | "onboarding_write" | "offboarding_read" | "offboarding_write" | "assignments_read" 
  | "assignments_write" | "history_read" | "call_feedback_read" | "plan_dates_write" | "capacity_read" 
  | "capacity_write" | "kpis_read" | "reassign" | "executive_read" | "reminders_write" | "transactions_read" 
  | "payment_plans_read" | "payment_plans_write" | "cash_collection_read" | "renewals_read" | "churn_read" 
  | "coach_costs_read" | "coach_costs_write" | "amount_owed_read" | "terms_write" | "forecasting_read" 
  | "cohort_read" | "win_tags_read" | "activity_read" | "configure" | "churn_rate_configure" 
  | "activation_dropoff_configure";

// Type for statements from any role in the system (type-safe)
export type AnyRoleStatements = {
  user?: readonly PermissionValues[];
  session?: readonly PermissionValues[];
  clients?: readonly PermissionValues[];
  coaches?: readonly PermissionValues[];
  tickets?: readonly PermissionValues[];
  billing?: readonly PermissionValues[];
  analytics?: readonly PermissionValues[];
  system?: readonly PermissionValues[];
} | readonly PermissionValues[] | Record<string, never>;
