import { supabase } from "../../lib/supabase";

export class FollowUpService {
	/**
	 * Check if student meets enrollment conditions for follow-up
	 * Condition 1: Student has enrollment record but NOT with statuses: paid, welcome_package_sent, dropped_out, declined_contract
	 */
	async checkEnrollmentConditions(studentId: string): Promise<boolean> {
		// Check if student has any enrollment records
		const { data: allEnrollments, error: enrollmentError } = await supabase
			.from("enrollments")
			.select("id, status")
			.eq("student_id", studentId);

		if (enrollmentError) {
			console.error("Error checking enrollments:", enrollmentError);
			return false;
		}

		// No enrollments at all - doesn't meet condition
		if (!allEnrollments || allEnrollments.length === 0) {
			return false;
		}

		// Check if student has any enrollment with restricted statuses
		const restrictedStatuses = ["paid", "welcome_package_sent", "dropped_out", "declined_contract"];
		const hasRestrictedStatus = allEnrollments.some(enrollment => 
			restrictedStatuses.includes(enrollment.status)
		);

		// Student has enrollments but none with restricted statuses - meets condition
		return !hasRestrictedStatus;
	}

	/**
	 * Check if student has active follow-ups
	 * Condition 2: Student doesn't have any automated follow-up record with status: activated, ongoing
	 */
	async checkExistingFollowUps(studentId: string): Promise<boolean> {
		const { data: activeFollowUps, error } = await supabase
			.from("automated_follow_ups")
			.select("id, status")
			.eq("student_id", studentId)
			.in("status", ["activated", "ongoing"]);

		if (error) {
			console.error("Error checking existing follow-ups:", error);
			return false;
		}

		// No active follow-ups - meets condition
		return !activeFollowUps || activeFollowUps.length === 0;
	}

	/**
	 * Find follow-up sequence by backend name
	 */
	async findSequenceByBackendName(backendName: string) {
		const { data: sequence, error } = await supabase
			.from("template_follow_up_sequences")
			.select("*")
			.eq("backend_name", backendName)
			.single();

		if (error) {
			console.error("Error finding sequence:", error);
			return null;
		}

		return sequence;
	}

	/**
	 * Create automated follow-up record
	 */
	async createFollowUp(studentId: string, sequenceId: string) {
		const now = new Date().toISOString();
		
		const { data: followUp, error } = await supabase
			.from("automated_follow_ups")
			.insert({
				student_id: studentId,
				sequence_id: sequenceId,
				current_step: 1,
				status: "activated",
				started_at: now,
				created_at: now,
				updated_at: now
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating follow-up:", error);
			throw new Error("Failed to create follow-up record");
		}

		return followUp;
	}

	/**
	 * Set follow-up for a student
	 * Main method that checks all conditions and creates follow-up if eligible
	 */
	async setFollowUp(studentId: string, sequenceBackendName: string) {
		// Find the sequence first
		const sequence = await this.findSequenceByBackendName(sequenceBackendName);
		if (!sequence) {
			return {
				success: false,
				error: "Follow-up sequence not found",
				code: "SEQUENCE_NOT_FOUND"
			};
		}

		// Check enrollment conditions
		const meetsEnrollmentConditions = await this.checkEnrollmentConditions(studentId);
		if (!meetsEnrollmentConditions) {
			return {
				success: false,
				error: "Student does not meet enrollment conditions",
				code: "ENROLLMENT_CONDITIONS_NOT_MET",
				details: "Student either has no enrollments or has enrollment with status: paid, welcome_package_sent, dropped_out, or declined_contract"
			};
		}

		// Check existing follow-ups
		const canCreateFollowUp = await this.checkExistingFollowUps(studentId);
		if (!canCreateFollowUp) {
			return {
				success: false,
				error: "Student already has active follow-up",
				code: "ACTIVE_FOLLOW_UP_EXISTS",
				details: "Student has an automated follow-up with status: activated or ongoing"
			};
		}

		// All conditions met - create the follow-up
		try {
			const followUp = await this.createFollowUp(studentId, sequence.id);
			
			return {
				success: true,
				data: {
					follow_up_id: followUp.id,
					student_id: followUp.student_id,
					sequence_id: followUp.sequence_id,
					status: followUp.status,
					started_at: followUp.started_at
				}
			};
		} catch (error) {
			return {
				success: false,
				error: "Failed to create follow-up",
				code: "CREATE_FAILED",
				details: error
			};
		}
	}

	/**
	 * Get all follow-up sequences
	 */
	async getAllSequences() {
		const { data: sequences, error } = await supabase
			.from("template_follow_up_sequences")
			.select("*")
			.order("display_name");

		if (error) {
			console.error("Error fetching sequences:", error);
			return [];
		}

		return sequences || [];
	}

	/**
	 * Get student's follow-up history
	 */
	async getStudentFollowUps(studentId: string) {
		const { data: followUps, error } = await supabase
			.from("automated_follow_ups")
			.select(`
				*,
				template_follow_up_sequences (
					id,
					display_name,
					subject,
					backend_name
				)
			`)
			.eq("student_id", studentId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching student follow-ups:", error);
			return [];
		}

		return followUps || [];
	}

	/**
	 * Find the next template message for a follow-up
	 */
	async findNextTemplateMessage(followUpId: string) {
		// First get the follow-up with its current step and sequence
		const { data: followUp, error: followUpError } = await supabase
			.from("automated_follow_ups")
			.select("id, current_step, sequence_id, status")
			.eq("id", followUpId)
			.single();

		if (followUpError || !followUp) {
			console.error("Error fetching follow-up:", followUpError);
			return null;
		}

		// Find template message with step_index = current_step
		const nextStepIndex = followUp.current_step || 1;
		const { data: nextMessage, error: messageError } = await supabase
			.from("template_follow_up_messages")
			.select("*")
			.eq("sequence_id", followUp.sequence_id)
			.eq("step_index", nextStepIndex)
			.eq("status", "active")
			.single();

		if (messageError) {
			// No next message found (this is expected when sequence is complete)
			if (messageError.code === "PGRST116") {
				return null;
			}
			console.error("Error fetching next message:", messageError);
			return null;
		}

		return nextMessage;
	}

	/**
	 * Advance follow-up to next step or mark as completed
	 */
	async advanceFollowUp(followUpId: string) {
		// Get current follow-up state
		const { data: followUp, error: followUpError } = await supabase
			.from("automated_follow_ups")
			.select("*")
			.eq("id", followUpId)
			.single();

		if (followUpError || !followUp) {
			return {
				success: false,
				error: "Follow-up not found",
				code: "FOLLOW_UP_NOT_FOUND"
			};
		}

		// Check if follow-up is in a valid state to advance
		if (!["activated", "ongoing"].includes(followUp.status)) {
			return {
				success: false,
				error: `Cannot advance follow-up with status: ${followUp.status}`,
				code: "INVALID_STATUS",
				details: "Follow-up must have status 'activated' or 'ongoing' to advance"
			};
		}

		// Check if there's a next message
		const nextMessage = await this.findNextTemplateMessage(followUpId);
		const now = new Date().toISOString();

		if (nextMessage) {
			// Advance to next step
			const newStep = followUp.current_step + 1;
			const newStatus = followUp.current_step === 1 ? "ongoing" : followUp.status;
			
			const { data: updatedFollowUp, error: updateError } = await supabase
				.from("automated_follow_ups")
				.update({
					current_step: newStep,
					status: newStatus,
					last_message_sent_at: now,
					updated_at: now
				})
				.eq("id", followUpId)
				.select()
				.single();

			if (updateError) {
				console.error("Error updating follow-up:", updateError);
				return {
					success: false,
					error: "Failed to advance follow-up",
					code: "UPDATE_FAILED",
					details: updateError
				};
			}

			return {
				success: true,
				data: {
					follow_up_id: updatedFollowUp.id,
					current_step: updatedFollowUp.current_step,
					status: updatedFollowUp.status,
					next_message: {
						id: nextMessage.id,
						step_index: nextMessage.step_index,
						message_content: nextMessage.message_content,
						time_delay_hours: nextMessage.time_delay_hours
					}
				}
			};
		} else {
			// No next message - mark as completed
			const { data: completedFollowUp, error: completeError } = await supabase
				.from("automated_follow_ups")
				.update({
					status: "completed",
					completed_at: now,
					updated_at: now
				})
				.eq("id", followUpId)
				.select()
				.single();

			if (completeError) {
				console.error("Error completing follow-up:", completeError);
				return {
					success: false,
					error: "Failed to complete follow-up",
					code: "COMPLETE_FAILED",
					details: completeError
				};
			}

			return {
				success: true,
				data: {
					follow_up_id: completedFollowUp.id,
					status: "completed",
					completed_at: completedFollowUp.completed_at,
					message: "Follow-up sequence completed"
				}
			};
		}
	}

	/**
	 * Stop all active follow-ups for a student
	 */
	async stopAllFollowUps(studentId: string) {
		// Find all active follow-ups for this student
		const { data: activeFollowUps, error: fetchError } = await supabase
			.from("automated_follow_ups")
			.select("id, status")
			.eq("student_id", studentId)
			.in("status", ["activated", "ongoing"]);

		if (fetchError) {
			console.error("Error fetching active follow-ups:", fetchError);
			return {
				success: false,
				error: "Failed to fetch active follow-ups",
				code: "FETCH_FAILED",
				details: fetchError
			};
		}

		if (!activeFollowUps || activeFollowUps.length === 0) {
			return {
				success: true,
				message: "No active follow-ups to stop",
				stopped_count: 0
			};
		}

		// Update all active follow-ups to disabled status
		const now = new Date().toISOString();
		const followUpIds = activeFollowUps.map(f => f.id);
		
		const { data: stoppedFollowUps, error: updateError } = await supabase
			.from("automated_follow_ups")
			.update({
				status: "disabled",
				updated_at: now
			})
			.in("id", followUpIds)
			.select();

		if (updateError) {
			console.error("Error stopping follow-ups:", updateError);
			return {
				success: false,
				error: "Failed to stop follow-ups",
				code: "UPDATE_FAILED",
				details: updateError
			};
		}

		return {
			success: true,
			message: `Successfully stopped ${stoppedFollowUps.length} follow-up(s)`,
			stopped_count: stoppedFollowUps.length,
			stopped_follow_ups: stoppedFollowUps.map(f => ({
				id: f.id,
				previous_status: activeFollowUps.find(af => af.id === f.id)?.status,
				new_status: f.status
			}))
		};
	}
}